
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Mail } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

// Mock data for customers
const mockCustomers = [
  { 
    id: "1", 
    name: "John Doe", 
    email: "john.doe@example.com", 
    phone: "+1 (123) 456-7890",
    orders: 5,
    totalSpent: 345.67,
    lastOrderDate: "2023-05-15"
  },
  { 
    id: "2", 
    name: "Jane Smith", 
    email: "jane.smith@example.com", 
    phone: "+1 (234) 567-8901",
    orders: 3,
    totalSpent: 230.50,
    lastOrderDate: "2023-04-22"
  },
  { 
    id: "3", 
    name: "Robert Johnson", 
    email: "robert.johnson@example.com", 
    phone: "+1 (345) 678-9012",
    orders: 8,
    totalSpent: 567.89,
    lastOrderDate: "2023-05-20"
  },
  { 
    id: "4", 
    name: "Sarah Williams", 
    email: "sarah.williams@example.com", 
    phone: "+1 (456) 789-0123",
    orders: 1,
    totalSpent: 75.25,
    lastOrderDate: "2023-03-10"
  }
];

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Customers</h1>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.orders}</TableCell>
                          <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>{customer.lastOrderDate}</TableCell>
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
