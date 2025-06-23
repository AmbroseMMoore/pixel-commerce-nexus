
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin } from "lucide-react";
import DeliveryZonesManager from "@/components/admin/delivery/DeliveryZonesManager";
import PincodeZonesManager from "@/components/admin/delivery/PincodeZonesManager";

const AdminDeliveryPartners = () => {
  const [activeTab, setActiveTab] = useState("zones");

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Delivery Management</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zones" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Zones
              </TabsTrigger>
              <TabsTrigger value="pincodes" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pincode Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="zones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Zones</CardTitle>
                  <CardDescription>
                    Manage delivery zones, charges, and estimated delivery days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeliveryZonesManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pincodes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pincode Zone Mapping</CardTitle>
                  <CardDescription>
                    Map pincodes to delivery zones for accurate delivery estimation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PincodeZonesManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDeliveryPartners;
