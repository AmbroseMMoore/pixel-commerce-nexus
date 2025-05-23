
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  LogOut,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal h-auto py-3",
          active
            ? "bg-secondary/80 font-medium text-custom-purple hover:bg-secondary/80"
            : "hover:bg-secondary/50"
        )}
      >
        {icon}
        <span>{label}</span>
        {active && <ChevronRight size={16} className="ml-auto" />}
      </Button>
    </Link>
  );
};

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const nav = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/admin"
    },
    {
      icon: <ShoppingBag size={20} />,
      label: "Products",
      href: "/admin/products"
    },
    {
      icon: <Tag size={20} />,
      label: "Sub-Categories",
      href: "/admin/subcategories"
    },
    {
      icon: <Package size={20} />,
      label: "Orders",
      href: "/admin/orders"
    },
    {
      icon: <Users size={20} />,
      label: "Customers",
      href: "/admin/customers"
    },
    {
      icon: <FileText size={20} />,
      label: "CMS",
      href: "/admin/cms"
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/admin/settings"
    }
  ];

  return (
    <div className={cn(
      "h-screen flex flex-col border-r border-gray-200 bg-white transition-all",
      isCollapsed ? "w-[70px]" : "w-[250px]"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-hidden">
          {!isCollapsed && (
            <span className="font-bold text-lg text-custom-purple">CuteBae Admin</span>
          )}
          {isCollapsed && (
            <span className="font-bold text-lg text-custom-purple">C</span>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-grow overflow-y-auto p-3 space-y-1">
        {nav.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={isCollapsed ? "" : item.label}
            href={item.href}
            active={
              item.href === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.href)
            }
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className={cn(
          "flex items-center p-2 rounded-lg",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.name || "Admin"} />
              <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white p-0"
      >
        <ChevronRight
          size={14}
          className={cn(
            "transition-transform",
            isCollapsed ? "rotate-0" : "rotate-180"
          )}
        />
      </Button>
    </div>
  );
};

export default AdminSidebar;
