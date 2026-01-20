import { useState, useCallback, useEffect } from "react";
import { ChatMessage, ProductRecommendation } from "@/types/chat";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "product-assistant-chat";

const generateId = () => Math.random().toString(36).substring(2, 15);

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! 👋 I'm here to help you find the perfect outfit. Tell me what you're looking for - you can describe the occasion, age group, preferred colors, or style!",
  timestamp: new Date(),
};

export const useProductAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages from session storage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }, []);

  // Save messages to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages]);

  const fetchProductsByIds = async (productIds: string[]): Promise<Map<string, Product>> => {
    const productMap = new Map<string, Product>();
    
    if (productIds.length === 0) return productMap;

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        slug,
        short_description,
        long_description,
        price_original,
        price_discounted,
        category_id,
        subcategory_id,
        age_ranges,
        specifications,
        size_chart_headers,
        size_chart_rows,
        is_low_stock,
        is_out_of_stock,
        is_featured,
        is_trending,
        is_active,
        created_at,
        updated_at
      `)
      .in("id", productIds)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching products:", error);
      return productMap;
    }

    // Fetch color variants for these products
    const { data: colors } = await supabase
      .from("product_colors")
      .select(`
        id,
        product_id,
        name,
        color_code
      `)
      .in("product_id", productIds);

    const colorIds = colors?.map(c => c.id) || [];
    
    // Fetch images and sizes for these colors
    const [imagesResult, sizesResult] = await Promise.all([
      supabase
        .from("product_images")
        .select("id, color_id, image_url, display_order")
        .in("color_id", colorIds)
        .order("display_order", { ascending: true }),
      supabase
        .from("product_sizes")
        .select("id, color_id, name, price_original, price_discounted, in_stock, stock_quantity, is_low_stock")
        .in("color_id", colorIds),
    ]);

    const images = imagesResult.data || [];
    const sizes = sizesResult.data || [];

    // Build products with variants
    for (const product of products || []) {
      const productColors = colors?.filter(c => c.product_id === product.id) || [];
      
      const colorVariants = productColors.map(color => ({
        id: color.id,
        name: color.name,
        colorCode: color.color_code,
        images: images
          .filter(img => img.color_id === color.id)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(img => img.image_url),
        sizes: sizes
          .filter(s => s.color_id === color.id)
          .map(s => ({
            id: s.id,
            name: s.name,
            inStock: s.in_stock ?? true,
            stockQuantity: s.stock_quantity,
            isLowStock: s.is_low_stock ?? false,
            priceOriginal: s.price_original,
            priceDiscounted: s.price_discounted,
          })),
      }));

      productMap.set(product.id, {
        id: product.id,
        title: product.title,
        slug: product.slug,
        shortDescription: product.short_description || "",
        longDescription: product.long_description || "",
        price: {
          original: product.price_original,
          discounted: product.price_discounted,
        },
        categoryId: product.category_id,
        subCategoryId: product.subcategory_id,
        colorVariants,
        ageRanges: product.age_ranges || [],
        specifications: product.specifications as Record<string, string> | string[],
        sizeChartHeaders: product.size_chart_headers as string[],
        sizeChartRows: product.size_chart_rows as string[][],
        isLowStock: product.is_low_stock ?? false,
        isOutOfStock: product.is_out_of_stock ?? false,
        isFeatured: product.is_featured ?? false,
        isTrending: product.is_trending ?? false,
        isActive: product.is_active ?? true,
        createdAt: new Date(product.created_at || Date.now()),
        updatedAt: new Date(product.updated_at || Date.now()),
      });
    }

    return productMap;
  };

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      isLoading: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history (exclude loading messages)
      const history = [...messages, userMessage]
        .filter(m => !m.isLoading)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      // Call edge function
      const { data, error } = await supabase.functions.invoke("product-assistant", {
        body: { messages: history },
      });

      if (error) {
        throw error;
      }

      // Parse response
      const { message, recommendations, followUpQuestion } = data;

      // Fetch full product details for recommendations
      const productIds = recommendations?.map((r: any) => r.productId) || [];
      const productMap = await fetchProductsByIds(productIds);

      // Build product recommendations
      const productRecommendations: ProductRecommendation[] = [];
      for (const rec of recommendations || []) {
        const product = productMap.get(rec.productId);
        if (product) {
          productRecommendations.push({
            product,
            relevanceReason: rec.relevanceReason,
            score: rec.score,
          });
        }
      }

      // Build assistant message
      let assistantContent = message || "";
      if (followUpQuestion) {
        assistantContent += `\n\n${followUpQuestion}`;
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: assistantContent,
        productRecommendations: productRecommendations.length > 0 ? productRecommendations : undefined,
        timestamp: new Date(),
      };

      // Replace loading message with actual response
      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
    } catch (error: any) {
      console.error("Chat error:", error);
      
      // Handle rate limiting
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.message?.includes("429") || error.status === 429) {
        errorMessage = "I'm getting too many requests right now. Please wait a moment and try again.";
      } else if (error.message?.includes("402") || error.status === 402) {
        errorMessage = "The AI service is temporarily unavailable. Please try again later.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Replace loading message with error
      const errorResponse: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => prev.slice(0, -1).concat(errorResponse));
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
