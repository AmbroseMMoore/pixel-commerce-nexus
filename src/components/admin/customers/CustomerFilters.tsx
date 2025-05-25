
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CustomerFilters;
