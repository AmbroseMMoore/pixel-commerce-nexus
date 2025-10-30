import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Package, 
  CreditCard, 
  MapPin, 
  Truck, 
  Clock,
  Edit,
  Loader2,
  User,
  Phone,
  Mail
} from "lucide-react";
import { useAdminOrderDetail } from "@/hooks/useAdminOrderDetail";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import OrderTimeline from "@/components/orders/OrderTimeline";

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

const StatusUpdateDialog = ({ order, onUpdate }: { order: any, onUpdate: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [deliveryPartner, setDeliveryPartner] = useState(order.delivery_partner_name || "");
  const [deliveryDate, setDeliveryDate] = useState(order.delivery_date || "");
  const [shipmentId, setShipmentId] = useState(order.shipment_id || "");
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
      onUpdate();
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
          <Edit className="h-4 w-4 mr-2" />
          Update Status
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

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, isLoading, refetch } = useAdminOrderDetail(orderId || '');

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading order details...</span>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  if (!order) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Package className="h-16 w-16 text-gray-400" />
            <h2 className="text-2xl font-semibold">Order Not Found</h2>
            <p className="text-gray-500">The requested order could not be found.</p>
            <Button onClick={() => navigate('/admin/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  const subtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
                <p className="text-sm text-muted-foreground">
                  Placed on {format(new Date(order.created_at), 'PPP')}
                </p>
              </div>
            </div>
            <StatusUpdateDialog order={order} onUpdate={refetch} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{order.order_items.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{order.total_amount.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                  {order.payment_status?.toUpperCase() || 'PENDING'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {item.images.length > 0 && (
                                <img 
                                  src={item.images[0].image_url} 
                                  alt={item.product?.title} 
                                  className="h-12 w-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.product?.title || 'Unknown Product'}</div>
                                {item.product?.slug && (
                                  <Link 
                                    to={`/product/${item.product.slug}`} 
                                    className="text-xs text-blue-600 hover:underline"
                                    target="_blank"
                                  >
                                    View Product
                                  </Link>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {item.color?.color_code && (
                                <div 
                                  className="h-4 w-4 rounded-full border" 
                                  style={{ backgroundColor: item.color.color_code }}
                                />
                              )}
                              <span className="text-sm">{item.color?.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.size?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right">₹{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">₹{item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {order.delivery_charge !== undefined && order.delivery_charge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Charge</span>
                        <span>₹{order.delivery_charge.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTimeline 
                    currentStatus={order.status} 
                    statusHistory={order.status_history}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div className="font-medium">{order.customer?.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </div>
                    <div className="text-sm">{order.customer?.email || 'No email'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Phone
                    </div>
                    <div className="text-sm">{order.customer?.mobile_number || 'No phone'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              {order.delivery_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{order.delivery_address.full_name}</div>
                      <div>{order.delivery_address.address_line_1}</div>
                      {order.delivery_address.address_line_2 && <div>{order.delivery_address.address_line_2}</div>}
                      <div>{order.delivery_address.city}, {order.delivery_address.state}</div>
                      <div>{order.delivery_address.postal_code}</div>
                      <div>{order.delivery_address.country}</div>
                      <div className="pt-2 border-t mt-2">
                        <span className="text-muted-foreground">Phone: </span>
                        {order.delivery_address.phone_number}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.delivery_zone && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Delivery Zone</div>
                      <div className="text-sm">
                        {order.delivery_zone.zone_name} (Zone {order.delivery_zone.zone_number})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Estimated: {order.delivery_zone.delivery_days_min}-{order.delivery_zone.delivery_days_max} days
                      </div>
                    </div>
                  )}
                  {order.delivery_pincode && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Pincode</div>
                      <div className="text-sm">{order.delivery_pincode}</div>
                    </div>
                  )}
                  {order.delivery_partner_name && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Delivery Partner</div>
                      <div className="text-sm">{order.delivery_partner_name}</div>
                    </div>
                  )}
                  {order.shipment_id && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Shipment ID</div>
                      <div className="text-sm font-mono">{order.shipment_id}</div>
                    </div>
                  )}
                  {order.delivery_date && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Expected Delivery</div>
                      <div className="text-sm">{format(new Date(order.delivery_date), 'PPP')}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Payment Method</div>
                    <div className="text-sm">{order.payment_method || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                      {order.payment_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                  {order.razorpay_payment_id && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Razorpay Payment ID</div>
                      <div className="text-xs font-mono break-all">{order.razorpay_payment_id}</div>
                    </div>
                  )}
                  {order.razorpay_order_id && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Razorpay Order ID</div>
                      <div className="text-xs font-mono break-all">{order.razorpay_order_id}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminOrderDetail;
