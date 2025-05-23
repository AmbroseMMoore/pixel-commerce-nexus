
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          navigate("/admin/login");
          return;
        }
        
        if (!data.session) {
          // If no session found, ensure user is logged out
          await logout();
          navigate("/admin/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    
    checkSession();
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" /> 
        <span className="ml-2">Verifying admin access...</span>
      </div>
    );
  }

  if (!isAdmin) {
    toast({
      title: "Access denied",
      description: "You don't have admin privileges to access this page.",
      variant: "destructive"
    });
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
