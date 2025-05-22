
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

// Mock data for demo
const mockProducts = [
  { 
    id: "1", 
    title: "Premium Cotton T-Shirt", 
    category: "Clothing", 
    subCategory: "T-Shirts", 
    price: 29.99,
    discountedPrice: 24.99,
    isLowStock: false,
    isOutOfStock: false
  },
  { 
    id: "2", 
    title: "Slim Fit Jeans", 
    category: "Clothing", 
    subCategory: "Bottoms", 
    price: 59.99,
    discountedPrice: 49.99,
    isLowStock: true,
    isOutOfStock: false
  },
  { 
    id: "3", 
    title: "Leather Ankle Boots", 
    category: "Footwear", 
    subCategory: "Boots", 
    price: 89.99,
    discountedPrice: null,
    isLowStock: false,
    isOutOfStock: true 
  }
];

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = mockProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // In a real app, you would make an API call to delete the product
    alert(`Delete product with ID: ${id}`);
  };

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
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.subCategory}</TableCell>
                          <TableCell>
                            {product.discountedPrice ? (
                              <>
                                <span className="line-through text-gray-400 mr-2">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className="text-green-600 font-medium">
                                  ${product.discountedPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              `$${product.price.toFixed(2)}`
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
                                <Link to={`/product/${product.id}`}>
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
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
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
