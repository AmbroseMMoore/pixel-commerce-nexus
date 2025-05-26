
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

  console.log('=== AdminProtectedRoute Check ===');
  console.log('User:', user?.email);
  console.log('Is Admin:', isAdmin);
  console.log('Loading:', loading);

  if (loading) {
    console.log('Auth still loading...');
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" /> 
        <span className="ml-2">Verifying admin access...</span>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, showing access denied');
    toast({
      title: "Access denied",
      description: "You don't have admin privileges to access this page.",
      variant: "destructive"
    });
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ Admin access granted');
  return <>{children}</>;
};

export default AdminProtectedRoute;
