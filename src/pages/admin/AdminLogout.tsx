
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AdminLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        toast({
          title: "Logged out",
          description: "You have been successfully logged out."
        });
        navigate("/admin/login");
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive"
        });
        navigate("/admin/login");
      }
    };

    handleLogout();
  }, [logout, navigate]);

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
