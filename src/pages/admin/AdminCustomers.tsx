
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, TestTube, RefreshCw } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from "@/components/ErrorBoundary";
import CustomerFilters from "@/components/admin/customers/CustomerFilters";
import CustomerStats from "@/components/admin/customers/CustomerStats";
import CustomerTable from "@/components/admin/customers/CustomerTable";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const { customers, isLoading, error, refetch } = useAdminCustomers();
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await refetch();
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

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
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Customer Management</h1>
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

            <CustomerStats
              totalCustomers={totalCustomers}
              totalRevenue={totalRevenue}
              avgOrderValue={avgOrderValue}
            />

            {showDebugPanel && <AdminDataTest />}

            {customers.length === 0 && !isLoading && !error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No customers found. When users sign up via Google Auth or email, they will appear here automatically.
                  Try refreshing or check the debug panel for connection issues.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <CustomerFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <CustomerTable
                customers={filteredCustomers}
                isLoading={isLoading}
              />
            </div>
          </div>
        </ErrorBoundary>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminCustomers;
