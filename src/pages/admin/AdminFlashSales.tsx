
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Zap } from "lucide-react";
import { useAdminFlashSales } from "@/hooks/useFlashSales";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AdminFlashSales = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<string>("");
  const [newFlashSale, setNewFlashSale] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    discount_percentage: 10
  });

  const queryClient = useQueryClient();
  const { data: flashSales, isLoading, refetch } = useAdminFlashSales();
  const { data: products } = useProducts();

  const handleCreateFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('flash_sales')
        .insert([{
          title: newFlashSale.title,
          description: newFlashSale.description,
          start_date: newFlashSale.start_date,
          end_date: newFlashSale.end_date,
          discount_percentage: newFlashSale.discount_percentage
        }]);

      if (error) throw error;

      toast({
        title: "Flash Sale Created",
        description: "Flash sale has been created successfully.",
      });

      setIsCreateDialogOpen(false);
      setNewFlashSale({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        discount_percentage: 10
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create flash sale",
        variant: "destructive",
      });
    }
  };

  const handleAddProductToSale = async (productId: string, salePrice: number) => {
    if (!selectedFlashSale) return;

    try {
      const { error } = await supabase
        .from('flash_sale_products')
        .insert([{
          flash_sale_id: selectedFlashSale,
          product_id: productId,
          sale_price: salePrice
        }]);

      if (error) throw error;

      toast({
        title: "Product Added",
        description: "Product has been added to flash sale.",
      });

      setIsAddProductDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['flash-sale-products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to flash sale",
        variant: "destructive",
      });
    }
  };

  const handleToggleFlashSale = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('flash_sales')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Flash Sale Updated",
        description: `Flash sale has been ${!isActive ? 'activated' : 'deactivated'}.`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update flash sale",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (flashSale: any) => {
    const now = new Date();
    const startDate = new Date(flashSale.start_date);
    const endDate = new Date(flashSale.end_date);

    if (!flashSale.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold">Flash Sales Management</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flash Sale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Flash Sale</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFlashSale} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newFlashSale.title}
                      onChange={(e) => setNewFlashSale(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summer Flash Sale"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newFlashSale.description}
                      onChange={(e) => setNewFlashSale(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Limited time offer on selected items"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date & Time</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={newFlashSale.start_date}
                        onChange={(e) => setNewFlashSale(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date & Time</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={newFlashSale.end_date}
                        onChange={(e) => setNewFlashSale(prev => ({ ...prev, end_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={newFlashSale.discount_percentage}
                      onChange={(e) => setNewFlashSale(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Flash Sale</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flash Sales ({flashSales?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading flash sales...</p>
              ) : flashSales && flashSales.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flashSales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sale.title}</div>
                            {sale.description && (
                              <div className="text-sm text-gray-500">{sale.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <div>
                              <div>{new Date(sale.start_date).toLocaleDateString()}</div>
                              <div className="text-gray-500">to {new Date(sale.end_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{sale.discount_percentage}%</TableCell>
                        <TableCell>{getStatusBadge(sale)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFlashSale(sale.id);
                                setIsAddProductDialogOpen(true);
                              }}
                            >
                              Add Products
                            </Button>
                            <Button
                              size="sm"
                              variant={sale.is_active ? "destructive" : "default"}
                              onClick={() => handleToggleFlashSale(sale.id, sale.is_active)}
                            >
                              {sale.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No flash sales created yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Create your first flash sale to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Product to Sale Dialog */}
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Products to Flash Sale</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                {products && products.length > 0 ? (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <ProductSelectionItem
                        key={product.id}
                        product={product}
                        onAdd={(salePrice) => handleAddProductToSale(product.id, salePrice)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No products available</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

interface ProductSelectionItemProps {
  product: any;
  onAdd: (salePrice: number) => void;
}

const ProductSelectionItem = ({ product, onAdd }: ProductSelectionItemProps) => {
  const [salePrice, setSalePrice] = useState(product.price_original * 0.8); // 20% discount by default

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium">{product.title}</h4>
        <p className="text-sm text-gray-500">Original Price: ₹{product.price_original}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={salePrice}
          onChange={(e) => setSalePrice(parseFloat(e.target.value))}
          className="w-24"
          step="0.01"
          placeholder="Sale Price"
        />
        <Button size="sm" onClick={() => onAdd(salePrice)}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default AdminFlashSales;
