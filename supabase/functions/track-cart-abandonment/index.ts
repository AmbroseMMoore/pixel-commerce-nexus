import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if system is enabled
    const { data: settings } = await supabase
      .from("cart_reminder_settings")
      .select("is_enabled")
      .eq("id", "default")
      .single();

    if (!settings?.is_enabled) {
      return new Response(JSON.stringify({ message: "System disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find customers with cart items but no recent order (2+ hours old carts)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Get all cart items older than 2 hours with customer info
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        customer_id,
        product_id,
        quantity,
        created_at,
        products(title, price_original, price_discounted),
        product_sizes(name, price_original, price_discounted),
        product_colors(name)
      `)
      .lte("created_at", twoHoursAgo);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ message: "No abandoned carts found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by customer
    const customerCarts: Record<string, any[]> = {};
    for (const item of cartItems) {
      if (!customerCarts[item.customer_id]) {
        customerCarts[item.customer_id] = [];
      }
      customerCarts[item.customer_id].push(item);
    }

    // Check which customers already have tracking or recent orders
    const customerIds = Object.keys(customerCarts);

    // Get customers who placed orders in the last 2 hours (not abandoned)
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("customer_id")
      .in("customer_id", customerIds)
      .gte("created_at", twoHoursAgo);

    const recentOrderCustomers = new Set(recentOrders?.map((o) => o.customer_id) || []);

    // Get existing tracking records
    const { data: existingTracking } = await supabase
      .from("cart_abandonment_tracking")
      .select("customer_id")
      .in("customer_id", customerIds);

    const trackedCustomers = new Set(existingTracking?.map((t) => t.customer_id) || []);

    let created = 0;

    for (const customerId of customerIds) {
      if (recentOrderCustomers.has(customerId) || trackedCustomers.has(customerId)) continue;

      // Get customer phone
      const { data: customer } = await supabase
        .from("customers")
        .select("mobile_number, name")
        .eq("id", customerId)
        .single();

      let phone = customer?.mobile_number;

      // Fallback to address phone
      if (!phone || phone === "") {
        const { data: address } = await supabase
          .from("addresses")
          .select("phone_number")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        phone = address?.phone_number;
      }

      if (!phone || phone === "") continue;

      // Build cart snapshot
      const items = customerCarts[customerId];
      const snapshot = items.map((item: any) => ({
        product_name: item.products?.title || "Unknown",
        quantity: item.quantity,
        price: item.product_sizes?.price_discounted || item.product_sizes?.price_original || item.products?.price_discounted || item.products?.price_original || 0,
        size: item.product_sizes?.name || "",
        color: item.product_colors?.name || "",
      }));

      const cartValue = snapshot.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      // Get first step delay
      const { data: firstStep } = await supabase
        .from("cart_reminder_schedule")
        .select("delay_hours")
        .eq("step_number", 1)
        .eq("is_active", true)
        .single();

      const delayHours = firstStep?.delay_hours || 2;
      const nextReminderAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from("cart_abandonment_tracking")
        .insert({
          customer_id: customerId,
          phone_number: phone,
          cart_snapshot: snapshot,
          cart_value: cartValue,
          next_reminder_at: nextReminderAt,
        });

      if (!insertError) created++;
    }

    return new Response(JSON.stringify({ message: `Tracked ${created} new abandoned carts` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
