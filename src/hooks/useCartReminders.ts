import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CartAbandonmentTracking {
  id: string;
  customer_id: string;
  phone_number: string;
  reminder_step: number;
  last_reminder_sent_at: string | null;
  next_reminder_at: string | null;
  cart_snapshot: any;
  cart_value: number;
  is_converted: boolean;
  is_stopped: boolean;
  is_paused: boolean;
  total_reminders_sent: number;
  converted_order_id: string | null;
  created_at: string;
  updated_at: string;
  customer?: { name: string; email: string; mobile_number: string };
}

export interface ReminderSchedule {
  id: string;
  step_number: number;
  delay_hours: number;
  message_type: string;
  message_preview: string | null;
  discount_code: string | null;
  discount_percentage: number | null;
  is_active: boolean;
}

export interface ReminderLog {
  id: string;
  tracking_id: string;
  customer_id: string;
  reminder_step: number;
  message_template: string | null;
  whatsapp_message_id: string | null;
  delivery_status: string;
  sent_at: string;
  error_message: string | null;
}

export interface ReminderSettings {
  id: string;
  is_enabled: boolean;
  whatsapp_phone_number: string | null;
}

export function useCartReminders(filters?: {
  status?: string;
  step?: number;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const trackingQuery = useQuery({
    queryKey: ["cart-abandonment-tracking", filters],
    queryFn: async () => {
      let query = supabase
        .from("cart_abandonment_tracking")
        .select("*, customers(name, email, mobile_number)")
        .order("created_at", { ascending: false });

      if (filters?.status === "active") {
        query = query.eq("is_converted", false).eq("is_stopped", false);
      } else if (filters?.status === "converted") {
        query = query.eq("is_converted", true);
      } else if (filters?.status === "stopped") {
        query = query.eq("is_stopped", true);
      }

      if (filters?.step) {
        query = query.eq("reminder_step", filters.step);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data || [];
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        results = results.filter((r: any) =>
          r.customers?.name?.toLowerCase().includes(s) ||
          r.phone_number?.includes(s) ||
          r.customers?.email?.toLowerCase().includes(s)
        );
      }

      return results;
    },
  });

  const scheduleQuery = useQuery({
    queryKey: ["cart-reminder-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_reminder_schedule")
        .select("*")
        .order("step_number");
      if (error) throw error;
      return data as ReminderSchedule[];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["cart-reminder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_reminder_settings")
        .select("*")
        .eq("id", "default")
        .single();
      if (error) throw error;
      return data as ReminderSettings;
    },
  });

  const logsQuery = useQuery({
    queryKey: ["cart-reminder-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_reminder_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ReminderLog[];
    },
  });

  const statsQuery = useQuery({
    queryKey: ["cart-reminder-stats"],
    queryFn: async () => {
      const { data: all, error: allErr } = await supabase
        .from("cart_abandonment_tracking")
        .select("id, is_converted, is_stopped, cart_value, converted_order_id");
      if (allErr) throw allErr;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayLogs, error: logErr } = await supabase
        .from("cart_reminder_logs")
        .select("id")
        .gte("sent_at", today.toISOString());
      if (logErr) throw logErr;

      const total = all?.length || 0;
      const active = all?.filter((a) => !a.is_converted && !a.is_stopped).length || 0;
      const converted = all?.filter((a) => a.is_converted).length || 0;
      const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
      const recoveredRevenue = all
        ?.filter((a) => a.is_converted)
        .reduce((sum, a) => sum + (Number(a.cart_value) || 0), 0) || 0;

      return {
        abandonedCarts: active,
        remindersSentToday: todayLogs?.length || 0,
        conversionRate,
        recoveredRevenue,
        totalTracked: total,
        totalConverted: converted,
      };
    },
  });

  const togglePause = useMutation({
    mutationFn: async ({ id, is_paused }: { id: string; is_paused: boolean }) => {
      const { error } = await supabase
        .from("cart_abandonment_tracking")
        .update({ is_paused })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-abandonment-tracking"] });
      toast({ title: "Updated successfully" });
    },
  });

  const stopReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cart_abandonment_tracking")
        .update({ is_stopped: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-abandonment-tracking"] });
      toast({ title: "Reminders stopped" });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async (schedule: Partial<ReminderSchedule> & { id: string }) => {
      const { id, ...updates } = schedule;
      const { error } = await supabase
        .from("cart_reminder_schedule")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-reminder-schedule"] });
      toast({ title: "Schedule updated" });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: Partial<ReminderSettings>) => {
      const { error } = await supabase
        .from("cart_reminder_settings")
        .update(settings)
        .eq("id", "default");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-reminder-settings"] });
      toast({ title: "Settings updated" });
    },
  });

  return {
    tracking: trackingQuery.data || [],
    trackingLoading: trackingQuery.isLoading,
    schedule: scheduleQuery.data || [],
    scheduleLoading: scheduleQuery.isLoading,
    settings: settingsQuery.data,
    settingsLoading: settingsQuery.isLoading,
    logs: logsQuery.data || [],
    logsLoading: logsQuery.isLoading,
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    togglePause,
    stopReminder,
    updateSchedule,
    updateSettings,
  };
}
