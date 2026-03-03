import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsAppMessage(
  phoneNumber: string,
  templateName: string,
  parameters: string[],
  accessToken: string,
  phoneNumberId: string
) {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: phoneNumber.replace(/[^0-9]/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: parameters.map((p) => ({ type: "text", text: p })),
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "WhatsApp API error");
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

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

    // Get records due for reminders
    const now = new Date().toISOString();
    const { data: dueReminders, error: dueError } = await supabase
      .from("cart_abandonment_tracking")
      .select("*")
      .eq("is_converted", false)
      .eq("is_stopped", false)
      .eq("is_paused", false)
      .lte("next_reminder_at", now)
      .order("next_reminder_at");

    if (dueError) throw dueError;
    if (!dueReminders || dueReminders.length === 0) {
      return new Response(JSON.stringify({ message: "No reminders due" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get schedule
    const { data: schedule } = await supabase
      .from("cart_reminder_schedule")
      .select("*")
      .eq("is_active", true)
      .order("step_number");

    if (!schedule || schedule.length === 0) {
      return new Response(JSON.stringify({ message: "No active schedule" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const maxStep = Math.max(...schedule.map((s: any) => s.step_number));
    let sent = 0;
    let errors = 0;

    for (const record of dueReminders) {
      const nextStep = record.reminder_step + 1;
      const stepConfig = schedule.find((s: any) => s.step_number === nextStep);

      if (!stepConfig || nextStep > maxStep) {
        // All steps done, stop reminders
        await supabase
          .from("cart_abandonment_tracking")
          .update({ is_stopped: true })
          .eq("id", record.id);
        continue;
      }

      // Get customer name
      const { data: customer } = await supabase
        .from("customers")
        .select("name")
        .eq("id", record.customer_id)
        .single();

      const customerName = customer?.name || "there";
      const cartItems = Array.isArray(record.cart_snapshot) ? record.cart_snapshot : [];
      const itemsList = cartItems
        .map((item: any) => `• ${item.product_name}`)
        .join("\n");

      // Determine template and parameters
      let templateName = "cart_reminder";
      let params: string[] = [customerName, itemsList, "https://cutebae.com/cart"];

      if (stepConfig.message_type === "urgency") {
        templateName = "cart_urgency";
        params = [customerName, itemsList, "https://cutebae.com/cart"];
      } else if (stepConfig.message_type === "discount" || stepConfig.message_type === "final_discount") {
        templateName = "cart_discount";
        params = [
          customerName,
          itemsList,
          stepConfig.discount_code || "COMEBACK10",
          String(stepConfig.discount_percentage || 10),
          "https://cutebae.com/cart",
        ];
      }

      let whatsappMessageId = null;
      let deliveryStatus = "sent";
      let errorMessage = null;

      // Send WhatsApp message if credentials are configured
      if (accessToken && phoneNumberId) {
        try {
          const result = await sendWhatsAppMessage(
            record.phone_number,
            templateName,
            params,
            accessToken,
            phoneNumberId
          );
          whatsappMessageId = result.messages?.[0]?.id;
          sent++;
        } catch (err) {
          console.error(`Failed to send to ${record.phone_number}:`, err);
          deliveryStatus = "failed";
          errorMessage = err.message;
          errors++;
        }
      } else {
        // No credentials, log as pending
        deliveryStatus = "pending";
        console.log(`[DRY RUN] Would send ${templateName} to ${record.phone_number}`);
        sent++;
      }

      // Log the reminder
      await supabase.from("cart_reminder_logs").insert({
        tracking_id: record.id,
        customer_id: record.customer_id,
        reminder_step: nextStep,
        message_template: templateName,
        whatsapp_message_id: whatsappMessageId,
        delivery_status: deliveryStatus,
        error_message: errorMessage,
      });

      // Find next step in schedule
      const futureStep = schedule.find((s: any) => s.step_number === nextStep + 1);
      const nextReminderAt = futureStep
        ? new Date(Date.now() + futureStep.delay_hours * 60 * 60 * 1000).toISOString()
        : null;

      // Update tracking
      await supabase
        .from("cart_abandonment_tracking")
        .update({
          reminder_step: nextStep,
          last_reminder_sent_at: now,
          next_reminder_at: nextReminderAt,
          total_reminders_sent: record.total_reminders_sent + 1,
          is_stopped: nextStep >= maxStep && !futureStep,
        })
        .eq("id", record.id);
    }

    return new Response(
      JSON.stringify({ message: `Sent ${sent} reminders, ${errors} errors` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
