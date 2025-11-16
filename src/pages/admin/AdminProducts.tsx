
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, Loader2, Filter, ArrowUpDown, Archive, RotateCcw } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useAdminProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteProduct, moveToDropped, restoreProduct } from "@/services/adminApi";
import { toast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { data: products, isLoading, error, refetch } = useAdminProducts();
  const { categories } = useCategories();
  
  // Separate active and dropped products
  const { activeProducts, droppedProducts } = useMemo(() => {
    if (!products) return { activeProducts: [], droppedProducts: [] };
    
    const active = products.filter((p: any) => p.isActive !== false);
    const dropped = products.filter((p: any) => p.isActive === false);
    
    return { activeProducts: active, droppedProducts: dropped };
  }, [products]);
  
  // Filter and sort function
  const filterAndSort = (productList: any[]) => {
    let filtered = productList.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }

    return filtered;
  };
  
  const filteredActiveProducts = useMemo(() => filterAndSort(activeProducts), [activeProducts, searchTerm, selectedCategory, sortBy]);
  const filteredDroppedProducts = useMemo(() => filterAndSort(droppedProducts), [droppedProducts, searchTerm, selectedCategory, sortBy]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      setDeletingId(id);
      try {
        await deleteProduct(id);
        
        toast({
          title: "Product Deleted",
          description: `"${title}" has been permanently deleted.`
        });
        
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

  const handleMoveToDropped = async (id: string, title: string) => {
    if (confirm(`Move "${title}" to Dropped Products? It will be hidden from the customer website but retained in the database.`)) {
      setProcessingId(id);
      try {
        await moveToDropped(id);
        
        toast({
          title: "Product Moved to Dropped",
          description: `"${title}" has been moved to Dropped Products and is now hidden from customers.`
        });
        
        refetch();
      } catch (error: any) {
        console.error("Error moving product:", error);
        toast({
          title: "Error",
          description: error.message || "There was an error moving the product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRestore = async (id: string, title: string) => {
    if (confirm(`Restore "${title}"? It will be visible to customers again.`)) {
      setProcessingId(id);
      try {
        await restoreProduct(id);
        
        toast({
          title: "Product Restored",
          description: `"${title}" has been restored and is now visible on the website.`
        });
        
        refetch();
      } catch (error: any) {
        console.error("Error restoring product:", error);
        toast({
          title: "Error",
          description: error.message || "There was an error restoring the product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setProcessingId(null);
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
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-10 w-full max-w-md" />
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-48" />
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
              {/* Search, Filter, and Sort Controls */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabs for Active and Dropped Products */}
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">
                    Active Products ({filteredActiveProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="dropped">
                    Dropped Products ({filteredDroppedProducts.length})
                  </TabsTrigger>
                </TabsList>

                {/* Active Products Tab */}
                <TabsContent value="active">
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
                        {filteredActiveProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="text-muted-foreground">
                                <p>No active products found.</p>
                                <Button 
                                  variant="outline" 
                                  className="mt-2" 
                                  onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("all");
                                  }}
                                >
                                  Clear Filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredActiveProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.title}</TableCell>
                              <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                              <TableCell>
                                {product.price.discounted ? (
                                  <div className="flex flex-col">
                                    <span className="line-through text-muted-foreground text-sm">
                                      ₹{product.price.original}
                                    </span>
                                    <span className="text-primary font-semibold">
                                      ₹{product.price.discounted}
                                    </span>
                                  </div>
                                ) : (
                                  <span>₹{product.price.original}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={product.isOutOfStock ? "destructive" : "default"}>
                                  {product.isOutOfStock ? "Out of Stock" : "In Stock"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link to={`/product/${product.slug}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link to={`/admin/products/${product.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMoveToDropped(product.id, product.title)}
                                    disabled={processingId === product.id}
                                  >
                                    {processingId === product.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Archive className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(product.id, product.title)}
                                    disabled={deletingId === product.id}
                                  >
                                    {deletingId === product.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
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
                </TabsContent>

                {/* Dropped Products Tab */}
                <TabsContent value="dropped">
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
                        {filteredDroppedProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="text-muted-foreground">
                                <p>No dropped products found.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDroppedProducts.map((product) => (
                            <TableRow key={product.id} className="opacity-60">
                              <TableCell className="font-medium">{product.title}</TableCell>
                              <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                              <TableCell>
                                {product.price.discounted ? (
                                  <div className="flex flex-col">
                                    <span className="line-through text-muted-foreground text-sm">
                                      ₹{product.price.original}
                                    </span>
                                    <span className="text-primary font-semibold">
                                      ₹{product.price.discounted}
                                    </span>
                                  </div>
                                ) : (
                                  <span>₹{product.price.original}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Dropped</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link to={`/admin/products/${product.id}`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRestore(product.id, product.title)}
                                    disabled={processingId === product.id}
                                  >
                                    {processingId === product.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4 text-primary" />
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminProducts;
