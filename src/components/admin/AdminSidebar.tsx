
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  FileText,
  FolderTree,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const location = useLocation();

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Sub Categories", 
      href: "/admin/subcategories",
      icon: FolderTree,
    },
    {
      title: "Flash Sales",
      href: "/admin/flash-sales",
      icon: Zap,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      href: "/admin/customers", 
      icon: Users,
    },
    {
      title: "CMS",
      href: "/admin/cms",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 pt-16 border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
