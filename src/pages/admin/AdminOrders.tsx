
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, RefreshCw, TestTube, Package, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from "@/components/ErrorBoundary";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return "bg-green-100 text-green-700 border-green-200";
    case 'processing':
      return "bg-blue-100 text-blue-700 border-blue-200";
    case 'shipped':
      return "bg-purple-100 text-purple-700 border-purple-200";
    case 'cancelled':
      return "bg-red-100 text-red-700 border-red-200";
    case 'pending':
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case 'returned':
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const { orders, isLoading, error, refetch } = useAdminOrders();
  
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

  const handleRefresh = async () => {
    console.log('🔄 Refreshing orders data...');
    await refetch();
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Order Management</h1>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowDebugPanel(!showDebugPanel)} 
                  variant="outline" 
                  size="sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Debug
                </Button>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold">{pendingOrders}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {showDebugPanel && <AdminDataTest />}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Order List ({filteredOrders.length} shown)</CardTitle>
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
                        <TableHead>Order Details</TableHead>
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
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Loading orders...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {orders.length === 0 
                              ? "No orders found. Orders will appear here when customers place orders." 
                              : "No orders match your search criteria."
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.order_number}</div>
                                <div className="text-sm text-gray-500">
                                  {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customer?.name || 'Unknown Customer'}</div>
                                <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">₹{Number(order.total_amount).toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  order.payment_status === "paid" ? "default" : 
                                  order.payment_status === "refunded" ? "secondary" : 
                                  "outline"
                                }
                              >
                                {order.payment_status?.toUpperCase() || 'PENDING'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" title="View Order Details">
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
        </ErrorBoundary>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
