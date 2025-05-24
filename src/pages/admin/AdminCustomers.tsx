
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Mail, RefreshCw } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { format } from "date-fns";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers, isLoading, refetch } = useAdminCustomers();
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    refetch();
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Customers</h1>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer Management</CardTitle>
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
                        <TableCell colSpan={8} className="text-center">
                          Loading customers...
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          {customers.length === 0 ? "No customers found. Customers will appear here when users register and place orders." : "No customers match your search."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.name} {customer.last_name}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.mobile_number}</TableCell>
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
