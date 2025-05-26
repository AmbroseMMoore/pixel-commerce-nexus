import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, RefreshCw, TestTube } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import { useAdminOrders } from "@/hooks/useAdminOrders";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return "bg-green-100 text-green-700";
    case 'processing':
      return "bg-blue-100 text-blue-700";
    case 'shipped':
      return "bg-purple-100 text-purple-700";
    case 'cancelled':
      return "bg-red-100 text-red-700";
    case 'pending':
      return "bg-yellow-100 text-yellow-700";
    case 'returned':
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const { orders, isLoading, refetch } = useAdminOrders();
  
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading orders...
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
