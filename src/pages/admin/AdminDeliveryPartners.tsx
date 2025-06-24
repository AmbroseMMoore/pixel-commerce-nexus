
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin } from "lucide-react";
import PincodeZonesManager from "@/components/admin/delivery/PincodeZonesManager";

const AdminDeliveryPartners = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Delivery Management</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pincode Management
              </CardTitle>
              <CardDescription>
                Manage delivery zones by uploading pincodes manually. Each pincode can be assigned to a specific delivery zone with custom pricing and delivery timeframes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PincodeZonesManager />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDeliveryPartners;
