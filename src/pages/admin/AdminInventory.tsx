import React, { useState } from "react";
import { Package, Search, AlertCircle, TrendingDown, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventory } from "@/hooks/useInventory";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const { inventoryData, isLoading, updateStockMutation } = useInventory({
    searchQuery,
    stockFilter,
  });

  const handleEdit = (sizeId: string, currentStock: number) => {
    setEditingId(sizeId);
    setEditValue(currentStock);
  };

  const handleSave = async (sizeId: string) => {
    try {
      await updateStockMutation.mutateAsync({
        sizeId,
        newQuantity: editValue,
      });
      setEditingId(null);
      toast({
        title: "Stock Updated",
        description: "Inventory has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update stock quantity.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const, color: "bg-red-500" };
    if (quantity <= 10) return { label: "Low Stock", variant: "secondary" as const, color: "bg-yellow-500" };
    return { label: "In Stock", variant: "default" as const, color: "bg-green-500" };
  };

  const stats = {
    total: inventoryData?.length || 0,
    inStock: inventoryData?.filter(item => item.stock_quantity > 10).length || 0,
    lowStock: inventoryData?.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 10).length || 0,
    outOfStock: inventoryData?.filter(item => item.stock_quantity === 0).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage stock levels across all products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by product name, color, or size..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : inventoryData && inventoryData.length > 0 ? (
                inventoryData.map((item) => {
                  const status = getStockStatus(item.stock_quantity);
                  const isEditing = editingId === item.size_id;

                  return (
                    <TableRow
                      key={item.size_id}
                      className={cn(
                        item.stock_quantity === 0 && "bg-red-50/50",
                        item.stock_quantity > 0 && item.stock_quantity <= 10 && "bg-yellow-50/50"
                      )}
                    >
                      <TableCell>
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.product_title}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.product_title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.color_code }}
                          />
                          <span className="text-sm">{item.color_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.size_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-20 text-right"
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold">{item.stock_quantity}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", status.color)} />
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.price_discounted ? (
                            <>
                              <span className="font-semibold text-red-600">
                                ₹{item.price_discounted}
                              </span>
                              <span className="text-gray-500 line-through ml-1">
                                ₹{item.price_original}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold">₹{item.price_original}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleSave(item.size_id)}
                              disabled={updateStockMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={updateStockMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item.size_id, item.stock_quantity)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No inventory items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
