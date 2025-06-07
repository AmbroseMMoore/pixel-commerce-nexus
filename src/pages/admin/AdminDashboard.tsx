
import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Circle, CircleDollarSign, PackageCheck, Users } from "lucide-react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { orders, isLoading: ordersLoading } = useAdminOrders();
  const { customers, isLoading: customersLoading } = useAdminCustomers();

  // Calculate stats from live data
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.last_order_date).length;

  // Generate sales data from orders
  const salesData = React.useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.total_amount;
    });

    return Object.entries(monthlyData).map(([month, sales]) => ({
      month,
      sales
    }));
  }, [orders]);

  // Generate category data from orders
  const categoryData = React.useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.order_items.forEach(item => {
        if (item.product?.title) {
          // Extract category from product title (this is a simplified approach)
          const productTitle = item.product.title.toLowerCase();
          let category = 'Other';
          
          if (productTitle.includes('boy')) category = 'Boys';
          else if (productTitle.includes('girl')) category = 'Girls';
          else if (productTitle.includes('toy')) category = 'Toys';
          else if (productTitle.includes('shoe')) category = 'Shoes';
          else if (productTitle.includes('accessory') || productTitle.includes('accessories')) category = 'Accessories';
          else if (productTitle.includes('newborn') || productTitle.includes('new born')) category = 'New Born';
          
          categories[category] = (categories[category] || 0) + item.total_price;
        }
      });
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
      case "ordered":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const recentOrders = orders.slice(0, 4);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button>Download Reports</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Live revenue data</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <PackageCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Total orders placed</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">Registered customers</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Circle className="h-5 w-5 text-muted-foreground fill-green-500" />
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{activeCustomers}</div>
                  <p className="text-xs text-muted-foreground">Customers with orders</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {ordersLoading ? (
                <Skeleton className="w-full h-full" />
              ) : salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3b82f6"
                      fill="#bfdbfe"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Distribution of sales across product categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {ordersLoading ? (
                <Skeleton className="w-full h-full" />
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Sales (₹)" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Overview of the latest customer orders</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-2">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Order ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{order.order_number}</td>
                        <td className="px-4 py-3">{order.customer?.name || 'Unknown'}</td>
                        <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{order.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
