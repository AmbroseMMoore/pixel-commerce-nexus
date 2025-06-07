
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, RefreshCw, TestTube, Edit } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return "bg-green-100 text-green-700";
    case 'shipped':
      return "bg-blue-100 text-blue-700";
    case 'confirmed':
      return "bg-purple-100 text-purple-700";
    case 'ordered':
      return "bg-yellow-100 text-yellow-700";
    case 'cancelled':
    case 'cancel request':
      return "bg-red-100 text-red-700";
    case 'return':
    case 'return request':
      return "bg-orange-100 text-orange-700";
    case 'refund':
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderStatusDialog = ({ order, onStatusUpdate }: { order: any, onStatusUpdate: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    "ordered",
    "confirmed", 
    "shipped",
    "delivered",
    "return request",
    "return",
    "cancel request",
    "cancelled",
    "refund"
  ];

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc('update_order_status', {
        order_id_param: order.id,
        new_status: newStatus,
        notes_param: notes || null,
        delivery_partner_param: newStatus === 'shipped' ? deliveryPartner : null,
        delivery_date_param: newStatus === 'shipped' ? deliveryDate : null,
        shipment_id_param: newStatus === 'shipped' ? shipmentId : null
      });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`,
      });

      setIsOpen(false);
      onStatusUpdate();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const requiresShippingInfo = newStatus === 'shipped';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Order Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresShippingInfo && (
            <>
              <div>
                <Label htmlFor="deliveryPartner">Delivery Partner Name</Label>
                <Input
                  id="deliveryPartner"
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  placeholder="e.g., Blue Dart, DTDC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shipmentId">Shipment ID</Label>
                <Input
                  id="shipmentId"
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  placeholder="Tracking number"
                  required
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={isUpdating || (requiresShippingInfo && (!deliveryPartner || !deliveryDate || !shipmentId))}
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  
  const { orders, isLoading, refetch } = useAdminOrders();
  const { fetchOrderStatusHistory } = useOrderDetails();
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "all" || 
      order.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    console.log('Refreshing orders data...');
    refetch();
  };

  const handleViewOrderDetails = async (order: any) => {
    try {
      const statusHistory = await fetchOrderStatusHistory(order.id);
      setSelectedOrder({
        ...order,
        statusHistory
      });
      setIsOrderDetailsOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast({
        title: 'Error',
        description: 'Could not load order details',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowDebugPanel(!showDebugPanel)} 
                variant="outline" 
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Debug
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {showDebugPanel && <AdminDataTest />}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Management ({orders.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="relative sm:max-w-xs flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="sm:w-48">
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="return request">Return Request</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="cancel request">Cancel Request</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Shipping Info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading orders...
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          {orders.length === 0 ? "No orders found. Orders will appear here when customers place orders." : "No orders match your search criteria."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer?.name || 'Unknown Customer'}</div>
                              <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>₹{Number(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.payment_status === "paid" ? "default" : order.payment_status === "refunded" ? "secondary" : "outline"}>
                              {order.payment_status?.toUpperCase() || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.delivery_partner_name && (
                              <div className="text-xs">
                                <div>{order.delivery_partner_name}</div>
                                {order.shipment_id && <div>ID: {order.shipment_id}</div>}
                                {order.delivery_date && <div>Due: {new Date(order.delivery_date).toLocaleDateString()}</div>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <OrderStatusDialog order={order} onStatusUpdate={handleRefresh} />
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedOrder && (
            <OrderDetailsModal
              isOpen={isOrderDetailsOpen}
              onClose={() => {
                setIsOrderDetailsOpen(false);
                setSelectedOrder(null);
              }}
              order={selectedOrder}
              onStatusChange={handleRefresh}
            />
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
