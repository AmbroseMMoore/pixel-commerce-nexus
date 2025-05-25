
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteProduct } from "@/services/adminApi";
import { toast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: products, isLoading, error, refetch } = useProducts();
  
  const filteredProducts = products?.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setDeletingId(id);
      try {
        await deleteProduct(id);
        
        toast({
          title: "Product Deleted",
          description: `"${title}" has been successfully deleted.`
        });
        
        // Refresh the product list
        refetch();
      } catch (error: any) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: error.message || "There was an error deleting the product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Products</h1>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Skeleton className="h-10 w-full max-w-md" />
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Skeleton key={n} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Products</h1>
              <Button asChild>
                <Link to="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
            </div>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Error loading products. Please try again later.</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Products</h1>
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {searchTerm ? "No products found matching your search." : "No products found. Add your first product!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>
                            {/* Use categoryId to display category name, but for now just show ID */}
                            {product.categoryId}
                          </TableCell>
                          <TableCell>
                            {product.price.discounted ? (
                              <>
                                <span className="line-through text-gray-400 mr-2">
                                  ₹{product.price.original.toFixed(2)}
                                </span>
                                <span className="text-green-600 font-medium">
                                  ₹{product.price.discounted.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              `₹${product.price.original.toFixed(2)}`
                            )}
                          </TableCell>
                          <TableCell>
                            {product.isOutOfStock ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Out of Stock
                              </span>
                            ) : product.isLowStock ? (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                In Stock
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/product/${product.slug}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/admin/products/${product.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDelete(product.id, product.title)}
                                disabled={deletingId === product.id}
                              >
                                {deletingId === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminProducts;
