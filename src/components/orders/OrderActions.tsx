
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X, RefreshCcw } from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  orderItems: Array<{
    id: string;
    product: { title: string };
    color?: { name: string } | null;
    size?: { name: string } | null;
    quantity: number;
  }>;
  onStatusChange?: () => void;
}

type ActionType = 'cancel' | 'return' | 'replace';

const OrderActions: React.FC<OrderActionsProps> = ({ 
  orderId, 
  orderStatus, 
  orderItems,
  onStatusChange 
}) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('cancel');
  const [selectedOrderItem, setSelectedOrderItem] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCancel = ['pending', 'processing'].includes(orderStatus);
  const canReturn = orderStatus === 'delivered';

  const handleOpenDialog = (type: ActionType) => {
    setActionType(type);
    setIsDialogOpen(true);
    setReason('');
    if (orderItems.length > 0) {
      setSelectedOrderItem(orderItems[0].id);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (actionType === 'cancel') {
        // Cancel order
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', orderId);

        if (error) throw error;

        // Add to order status history
        await supabase.rpc('update_order_status', {
          order_id_param: orderId,
          new_status: 'cancelled',
          notes_param: reason || 'Cancelled by customer'
        });

        toast.success("Order cancelled successfully!");
      } else {
        // Create return/replacement request
        const { error } = await supabase
          .from('returns')
          .insert({
            order_id: orderId,
            order_item_id: selectedOrderItem,
            customer_id: user.id,
            reason,
            return_type: actionType === 'return' ? 'return' : 'replace'
          });

        if (error) throw error;

        toast.success(
          actionType === 'return' 
            ? "Return request submitted successfully!" 
            : "Replacement request submitted successfully!"
        );
      }

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Failed to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mt-2">
        {canCancel && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleOpenDialog('cancel')}
            className="gap-1"
          >
            <X size={16} /> Cancel Order
          </Button>
        )}
        
        {canReturn && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleOpenDialog('return')}
              className="gap-1"
            >
              <RefreshCcw size={16} /> Return
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleOpenDialog('replace')}
              className="gap-1"
            >
              <RefreshCcw size={16} /> Replace
            </Button>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' ? 'Cancel Order' : 
               actionType === 'return' ? 'Request Return' : 'Request Replacement'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' 
                ? 'Are you sure you want to cancel this order?' 
                : `Please provide details for your ${actionType} request.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {(actionType === 'return' || actionType === 'replace') && orderItems.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="orderItem">Select Item</Label>
                <Select
                  value={selectedOrderItem}
                  onValueChange={setSelectedOrderItem}
                >
                  <SelectTrigger id="orderItem">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.product.title} {item.color?.name && `- ${item.color.name}`} {item.size?.name && `- ${item.size.name}`} (Qty: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason{actionType !== 'cancel' && ' (required)'}</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  actionType === 'cancel' 
                    ? 'Why are you cancelling this order? (optional)' 
                    : `Why do you want to ${actionType} this item?`
                }
                rows={3}
                required={actionType !== 'cancel'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || (actionType !== 'cancel' && !reason)}
              variant={actionType === 'cancel' ? "destructive" : "default"}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderActions;
