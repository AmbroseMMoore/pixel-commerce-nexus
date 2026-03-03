import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Props {
  trackingId: string;
  onClose: () => void;
}

const CartReminderDetailsModal: React.FC<Props> = ({ trackingId, onClose }) => {
  const { data: tracking, isLoading: trackingLoading } = useQuery({
    queryKey: ["cart-tracking-detail", trackingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_abandonment_tracking")
        .select("*, customers(name, email, mobile_number)")
        .eq("id", trackingId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["cart-reminder-logs-detail", trackingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_reminder_logs")
        .select("*")
        .eq("tracking_id", trackingId)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const isLoading = trackingLoading || logsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "read": return "bg-blue-100 text-blue-800";
      case "sent": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cart Reminder Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-medium mb-2">Customer</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {(tracking as any)?.customers?.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {(tracking as any)?.customers?.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {tracking?.phone_number}</p>
              </div>
            </div>

            {/* Cart Snapshot */}
            {tracking?.cart_snapshot && (
              <div>
                <h3 className="font-medium mb-2">Cart Items</h3>
                <div className="space-y-2">
                  {(Array.isArray(tracking.cart_snapshot) ? tracking.cart_snapshot : []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm p-2 rounded border">
                      <span>{item.title || item.product_name || `Item ${i + 1}`}</span>
                      <span className="font-medium">₹{item.price || item.unit_price || 0} × {item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium mt-2">
                  Total: ₹{Number(tracking.cart_value).toLocaleString()}
                </p>
              </div>
            )}

            {/* Tracking Info */}
            <div>
              <h3 className="font-medium mb-2">Reminder Status</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Step:</span> {tracking?.reminder_step}/5</p>
                <p><span className="text-muted-foreground">Total Sent:</span> {tracking?.total_reminders_sent}</p>
                <p><span className="text-muted-foreground">Created:</span> {tracking?.created_at ? format(new Date(tracking.created_at), "MMM d, yyyy HH:mm") : "—"}</p>
              </div>
            </div>

            {/* Message History */}
            <div>
              <h3 className="font-medium mb-2">Message History</h3>
              {!logs || logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages sent yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 rounded border text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Step {log.reminder_step}</span>
                        <Badge className={getStatusColor(log.delivery_status)}>
                          {log.delivery_status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {format(new Date(log.sent_at), "MMM d, yyyy HH:mm")}
                      </p>
                      {log.error_message && (
                        <p className="text-red-600 text-xs">{log.error_message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartReminderDetailsModal;
