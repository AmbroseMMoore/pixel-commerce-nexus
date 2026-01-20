import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductSummary {
  id: string;
  title: string;
  shortDescription: string;
  priceOriginal: number;
  priceDiscounted: number | null;
  ageRanges: string[];
  colors: string[];
  categoryName: string;
  subcategoryName: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active products with their details
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        title,
        short_description,
        price_original,
        price_discounted,
        age_ranges,
        category_id,
        subcategory_id,
        categories!products_category_id_fkey(name),
        subcategories!products_subcategory_id_fkey(name)
      `)
      .eq("is_active", true)
      .limit(100);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch colors for products
    const productIds = products?.map(p => p.id) || [];
    const { data: colors } = await supabase
      .from("product_colors")
      .select("product_id, name")
      .in("product_id", productIds);

    // Build product summaries for AI
    const productSummaries: ProductSummary[] = (products || []).map(product => ({
      id: product.id,
      title: product.title,
      shortDescription: product.short_description || "",
      priceOriginal: product.price_original,
      priceDiscounted: product.price_discounted,
      ageRanges: product.age_ranges || [],
      colors: (colors || [])
        .filter(c => c.product_id === product.id)
        .map(c => c.name),
      categoryName: (product.categories as any)?.name || "",
      subcategoryName: (product.subcategories as any)?.name || "",
    }));

    // Build system prompt
    const systemPrompt = `You are a helpful shopping assistant for a kids' clothing store. Your job is to understand what the customer is looking for and recommend the most relevant products from our catalog.

Available Products Catalog (${productSummaries.length} products):
${JSON.stringify(productSummaries, null, 2)}

Guidelines:
1. Understand the customer's needs: age of child, occasion, color preferences, style, budget, etc.
2. Match products based on: title, description, age ranges, colors, category, and price
3. If the query is vague, ask a clarifying question
4. Recommend 1-5 products that best match the customer's needs
5. Explain why each product is a good match
6. Be friendly, helpful, and conversational
7. If no products match well, be honest and suggest browsing categories

Always use the recommend_products tool to structure your response.`;

    // Call Lovable AI with tool calling
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_products",
              description: "Return product recommendations to the customer",
              parameters: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "Your conversational response to the customer",
                  },
                  recommendations: {
                    type: "array",
                    description: "List of recommended products (0-5 items)",
                    items: {
                      type: "object",
                      properties: {
                        productId: {
                          type: "string",
                          description: "The product ID from the catalog",
                        },
                        relevanceReason: {
                          type: "string",
                          description: "Brief explanation of why this product matches (1-2 sentences)",
                        },
                        score: {
                          type: "number",
                          description: "Relevance score from 0-100",
                        },
                      },
                      required: ["productId", "relevanceReason", "score"],
                    },
                  },
                  followUpQuestion: {
                    type: "string",
                    description: "Optional follow-up question to better understand customer needs",
                  },
                },
                required: ["message", "recommendations"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_products" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI Response:", JSON.stringify(aiData, null, 2));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "recommend_products") {
      // Fallback if no tool call
      const content = aiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request. Could you try rephrasing?";
      return new Response(
        JSON.stringify({ message: content, recommendations: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Validate product IDs exist in our catalog
    const validProductIds = new Set(productSummaries.map(p => p.id));
    const validRecommendations = (result.recommendations || [])
      .filter((r: any) => validProductIds.has(r.productId))
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        message: result.message || "",
        recommendations: validRecommendations,
        followUpQuestion: result.followUpQuestion,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Product assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
