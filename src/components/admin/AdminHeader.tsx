
import React from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUser } from "@/data/mockData";

const AdminHeader = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search..."
          className="w-full max-w-sm pl-10"
        />
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={18} />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
          <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AdminHeader;
