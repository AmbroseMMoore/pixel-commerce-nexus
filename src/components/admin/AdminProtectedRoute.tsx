
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading, user } = useAuth();

  console.log('🔐 AdminProtectedRoute Check:', {
    userEmail: user?.email,
    isAdmin,
    loading
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    console.log('🚫 User is not admin, showing access denied');
    toast({
      title: "Access Denied",
      description: "You don't have admin privileges to access this page.",
      variant: "destructive"
    });
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ Admin access granted');
  return <>{children}</>;
};

export default AdminProtectedRoute;
