
import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Search submitted");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Use email if name is not available
  const displayName = user?.name || user?.email || "Admin";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search..."
          className="w-full max-w-sm pl-10"
        />
      </form>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={18} />
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden md:block">{displayName}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback>{avatarInitial}</AvatarFallback>
          </Avatar>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hidden sm:flex items-center gap-1">
            <LogOut size={16} />
            <span className="ml-1">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
