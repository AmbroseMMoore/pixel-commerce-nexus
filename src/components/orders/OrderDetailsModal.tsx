
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OrderTimeline from "./OrderTimeline";
import OrderActions from "./OrderActions";
import { format } from "date-fns";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    order_items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      product: {
        title: string;
      };
      color?: {
        name: string;
      } | null;
      size?: {
        name: string;
      } | null;
    }>;
    statusHistory?: Array<{
      status: string;
      changed_at: string;
      notes?: string | null;
      delivery_partner_name?: string | null;
      shipment_id?: string | null;
    }>;
  };
  onStatusChange?: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order,
  onStatusChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Order #{order.order_number}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              order.status === 'delivered' 
                ? 'bg-green-100 text-green-800'
                : order.status === 'processing'
                ? 'bg-blue-100 text-blue-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </DialogTitle>
          <DialogDescription>
            View and manage your order details, timeline, and take actions like cancel, return, or replace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">
                Order Date: {format(new Date(order.created_at), 'MMM dd, yyyy')}
              </p>
              <p className="text-gray-500 text-sm">
                Payment Status: 
                <span className={`ml-1 ${
                  order.payment_status === 'paid' 
                    ? 'text-green-600' 
                    : 'text-amber-600'
                }`}>
                  {order.payment_status?.charAt(0).toUpperCase() + (order.payment_status?.slice(1) || '')}
                </span>
              </p>
              <p className="font-medium mt-2">
                Total: ₹{order.total_amount.toFixed(2)}
              </p>
            </div>

            <OrderActions 
              orderId={order.id}
              orderStatus={order.status}
              orderItems={order.order_items}
              onStatusChange={onStatusChange}
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.color?.name && `${item.color.name}`} {item.size?.name && `/ ${item.size.name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">₹{item.unit_price.toFixed(2)} x {item.quantity}</p>
                    <p className="font-medium">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <OrderTimeline 
            currentStatus={order.status} 
            statusHistory={order.statusHistory}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
