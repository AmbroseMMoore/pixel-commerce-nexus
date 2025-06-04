
import React from "react";
import { Clock, CheckCircle, Truck, Package, XCircle, RotateCcw } from "lucide-react";
import { format } from "date-fns";

type StatusHistoryItem = {
  status: string;
  changed_at: string;
  notes?: string | null;
  delivery_partner_name?: string | null;
  shipment_id?: string | null;
};

interface OrderTimelineProps {
  currentStatus: string;
  statusHistory?: StatusHistoryItem[];
}

const statusIconMap: Record<string, React.ReactNode> = {
  "pending": <Clock className="h-5 w-5 text-amber-500" />,
  "processing": <Package className="h-5 w-5 text-blue-500" />,
  "shipped": <Truck className="h-5 w-5 text-indigo-500" />,
  "delivered": <CheckCircle className="h-5 w-5 text-green-500" />,
  "cancelled": <XCircle className="h-5 w-5 text-red-500" />,
  "returned": <RotateCcw className="h-5 w-5 text-purple-500" />
};

const statusTextColorMap: Record<string, string> = {
  "pending": "text-amber-700 bg-amber-50",
  "processing": "text-blue-700 bg-blue-50",
  "shipped": "text-indigo-700 bg-indigo-50",
  "delivered": "text-green-700 bg-green-50",
  "cancelled": "text-red-700 bg-red-50",
  "returned": "text-purple-700 bg-purple-50",
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  // If no status history provided, create a placeholder with just the current status
  const timeline = statusHistory.length > 0 
    ? statusHistory 
    : [{ status: currentStatus, changed_at: new Date().toISOString() }];

  // Sort timeline by date (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  return (
    <div className="space-y-4 my-4">
      <h3 className="font-semibold text-lg text-gray-900">Order Status Timeline</h3>
      <div className="space-y-4">
        {sortedTimeline.map((item, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {statusIconMap[item.status] || <Clock className="h-5 w-5 text-gray-500" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusTextColorMap[item.status] || "text-gray-700 bg-gray-100"
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  {item.shipment_id && (
                    <span className="ml-2 text-xs text-gray-500">
                      Tracking ID: {item.shipment_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 sm:mt-0">
                  {format(new Date(item.changed_at), 'MMM dd, yyyy - hh:mm a')}
                </p>
              </div>
              {item.delivery_partner_name && (
                <p className="text-sm text-gray-600 mt-1">
                  Delivery Partner: {item.delivery_partner_name}
                </p>
              )}
              {item.notes && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline;
