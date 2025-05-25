
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Package, TestTube, RefreshCw, AlertCircle } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from "@/components/ErrorBoundary";
import OrderFilters from "@/components/admin/orders/OrderFilters";
import OrderStats from "@/components/admin/orders/OrderStats";
import OrderTable from "@/components/admin/orders/OrderTable";

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

            <OrderStats
              totalOrders={totalOrders}
              totalRevenue={totalRevenue}
              avgOrderValue={avgOrderValue}
              pendingOrders={pendingOrders}
            />

            {showDebugPanel && <AdminDataTest />}

            <div className="space-y-4">
              <OrderFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />
              
              <OrderTable
                orders={filteredOrders}
                isLoading={isLoading}
              />
            </div>
          </div>
        </ErrorBoundary>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
