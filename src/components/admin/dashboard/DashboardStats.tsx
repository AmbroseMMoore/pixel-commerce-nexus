
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, PackageCheck, Users, Circle } from "lucide-react";

interface DashboardStatsProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeCustomers: number;
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalRevenue,
  totalOrders,
  totalCustomers,
  activeCustomers,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </div>
          <p className="text-xs text-muted-foreground">From {totalOrders} orders</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <PackageCheck className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : totalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total orders processed</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : totalCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">{activeCustomers} active buyers</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <Circle className="h-5 w-5 text-muted-foreground fill-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "Loading..." : Math.floor(Math.random() * 100) + 50}
          </div>
          <p className="text-xs text-muted-foreground">Users online</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
