
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AdminLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const handleLogout = async () => {
      if (isLoggingOut) return; // Prevent multiple logout attempts
      
      setIsLoggingOut(true);
      
      try {
        await logout();
        
        if (isMounted) {
          toast({
            title: "Logged out",
            description: "You have been successfully logged out."
          });
          navigate("/admin/login", { replace: true });
        }
      } catch (error) {
        console.error("Logout error:", error);
        
        if (isMounted) {
          toast({
            title: "Logout failed",
            description: "There was an error logging out. Please try again.",
            variant: "destructive"
          });
          navigate("/admin/login", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoggingOut(false);
        }
      }
    };

    // Add a small delay to prevent immediate execution issues
    const timeoutId = setTimeout(() => {
      handleLogout();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [logout, navigate, isLoggingOut]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Logging out...</span>
      </div>
    </div>
  );
};

export default AdminLogout;
