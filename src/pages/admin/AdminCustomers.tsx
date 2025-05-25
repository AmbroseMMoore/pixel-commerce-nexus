import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Mail, RefreshCw, Users, AlertCircle, TestTube } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminDataTest from "@/components/AdminDataTest";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const { customers, isLoading, refetch } = useAdminCustomers();
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    console.log('=== Manual refresh triggered ===');
    refetch();
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Customers</h1>
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
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {showDebugPanel && <AdminDataTest />}

          {customers.length === 0 && !isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No customers found. When users sign up via Google Auth or email, they will appear here automatically.
                Try refreshing or check the browser console for any errors.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer Management ({customers.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading customers...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          {customers.length === 0 
                            ? "No customers found. New signups will appear here automatically." 
                            : "No customers match your search criteria."
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.name} {customer.last_name}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.mobile_number || 'N/A'}</TableCell>
                          <TableCell>{customer.orders_count}</TableCell>
                          <TableCell>₹{customer.total_spent.toFixed(2)}</TableCell>
                          <TableCell>
                            {customer.last_order_date 
                              ? format(new Date(customer.last_order_date), 'MMM dd, yyyy')
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
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
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminCustomers;
