
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { OrderStatus, PaymentStatus, type Order } from "@/types/user";

// Mock data for orders
const mockOrders: Partial<Order>[] = [
  { 
    id: "1", 
    orderNumber: "ORD-12345",
    userId: "user-1",
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    totalAmount: 129.99,
    createdAt: new Date("2023-05-20")
  },
  { 
    id: "2", 
    orderNumber: "ORD-12344",
    userId: "user-2",
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    totalAmount: 79.50,
    createdAt: new Date("2023-05-19")
  },
  { 
    id: "3", 
    orderNumber: "ORD-12343",
    userId: "user-3",
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    totalAmount: 199.95,
    createdAt: new Date("2023-05-18")
  },
  { 
    id: "4", 
    orderNumber: "ORD-12342",
    userId: "user-4",
    status: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
    totalAmount: 49.99,
    createdAt: new Date("2023-05-17")
  },
  { 
    id: "5", 
    orderNumber: "ORD-12341",
    userId: "user-5",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    totalAmount: 89.99,
    createdAt: new Date("2023-05-16")
  },
  { 
    id: "6", 
    orderNumber: "ORD-12340",
    userId: "user-1",
    status: OrderStatus.RETURNED,
    paymentStatus: PaymentStatus.REFUNDED,
    totalAmount: 149.95,
    createdAt: new Date("2023-05-15")
  }
];

// Mock customer data
const mockCustomerMap: Record<string, string> = {
  "user-1": "John Doe",
  "user-2": "Jane Smith",
  "user-3": "Robert Johnson",
  "user-4": "Sarah Williams",
  "user-5": "Michael Brown"
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-700";
    case OrderStatus.PROCESSING:
      return "bg-blue-100 text-blue-700";
    case OrderStatus.SHIPPED:
      return "bg-purple-100 text-purple-700";
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-700";
    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-700";
    case OrderStatus.RETURNED:
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockCustomerMap[order.userId || ""]?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "all" || 
      order.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Management</CardTitle>
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
                      <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                      <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                      <SelectItem value={OrderStatus.RETURNED}>Returned</SelectItem>
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
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{mockCustomerMap[order.userId || ""]}</TableCell>
                          <TableCell>{order.createdAt?.toLocaleDateString()}</TableCell>
                          <TableCell>${order.totalAmount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status as OrderStatus)}`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.paymentStatus === "PAID" ? "default" : order.paymentStatus === "REFUNDED" ? "secondary" : "outline"}>
                              {order.paymentStatus}
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
