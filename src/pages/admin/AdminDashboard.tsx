
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";

const AdminDashboard = () => {
  const { customers, isLoading: customersLoading } = useAdminCustomers();
  const { orders, isLoading: ordersLoading } = useAdminOrders();

  // Calculate real statistics from Supabase data
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.orders_count > 0).length;

  // Generate sales data from real orders (last 7 months)
  const salesData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (6 - index), 1);
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === monthDate.getMonth() && 
               orderDate.getFullYear() === monthDate.getFullYear();
      });
      
      const monthSales = monthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      return { month, sales: monthSales };
    });
  }, [orders]);

  // Generate category data from real orders
  const categoryData = React.useMemo(() => {
    const categoryStats: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.order_items.forEach(item => {
        const productTitle = item.product?.title || 'Unknown';
        const category = productTitle.split(' ')[0] || 'Other';
        categoryStats[category] = (categoryStats[category] || 0) + Number(item.total_price || 0);
      });
    });

    return Object.entries(categoryStats)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 6);
  }, [orders]);

  // Get recent orders (last 4)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map(order => ({
      id: order.order_number,
      customer: order.customer?.name || 'Unknown Customer',
      date: new Date(order.created_at).toLocaleDateString(),
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      total: Number(order.total_amount || 0),
    }));

  const isLoading = customersLoading || ordersLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button>Download Reports</Button>
        </div>

        <DashboardStats
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          totalCustomers={totalCustomers}
          activeCustomers={activeCustomers}
          isLoading={isLoading}
        />

        <DashboardCharts
          salesData={salesData}
          categoryData={categoryData}
          isLoading={isLoading}
        />

        <RecentOrdersTable
          recentOrders={recentOrders}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
