
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { AdminCustomer } from "@/hooks/admin/useAdminCustomersData";

interface CustomerTableProps {
  customers: AdminCustomer[];
  isLoading: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  isLoading
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Customer List ({customers.length} shown)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading customers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No customers match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.mobile_number || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{customer.orders_count}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₹{customer.total_spent.toFixed(2)}</span>
                    </TableCell>
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
                        <Button size="sm" variant="ghost" title="Send Email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" title="View Details">
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
  );
};

export default CustomerTable;
