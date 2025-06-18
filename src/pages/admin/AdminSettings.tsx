
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLogsSettings from "@/components/admin/AdminLogsSettings";
import MediaStorageConfig from "@/components/admin/MediaStorageConfig";
import { Settings } from "lucide-react";

const AdminSettings = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <MediaStorageConfig />
            </div>
            <div>
              <AdminLogsSettings />
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminSettings;
