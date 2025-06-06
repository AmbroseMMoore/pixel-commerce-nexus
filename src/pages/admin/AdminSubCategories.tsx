
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { fetchAllSubcategories, createSubCategory, updateSubCategory, deleteSubCategory } from "@/services/adminApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SubCategory } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSubCategories = () => {
  const queryClient = useQueryClient();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // For the add/edit form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    slug?: string;
    categoryId?: string;
    general?: string;
  }>({});
  const [currentSubCategory, setCurrentSubCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  }>({
    id: "",
    name: "",
    slug: "",
    categoryId: ""
  });

  // Fetch subcategories
  const { data: subCategories = [], isLoading, error, refetch } = useQuery({
    queryKey: ["subcategories", "admin"],
    queryFn: fetchAllSubcategories
  });

  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = 
      subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategoryFilter === "all" || 
      subCategory.categoryId === selectedCategoryFilter;
      
    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentSubCategory({
      id: "",
      name: "",
      slug: "",
      categoryId: ""
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleEdit = (subCategory: SubCategory) => {
    setIsEditing(true);
    setCurrentSubCategory({...subCategory});
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sub-category? This action cannot be undone.")) {
      try {
        await deleteSubCategory(id);
        toast({
          title: "Sub-category deleted",
          description: "The sub-category has been successfully removed."
        });
        queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      } catch (error: any) {
        console.error("Error deleting sub-category:", error);
        let errorMessage = "There was an error deleting the sub-category.";
        
        if (error.message) {
          errorMessage += ` ${error.message}`;
        } else if (error.details) {
          errorMessage += ` ${error.details}`;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      slug?: string;
      categoryId?: string;
    } = {};
    
    if (!currentSubCategory.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (currentSubCategory.name.length > 50) {
      errors.name = "Name must be 50 characters or less";
    }
    
    if (currentSubCategory.slug && !/^[a-z0-9-]+$/.test(currentSubCategory.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    
    if (!currentSubCategory.categoryId) {
      errors.categoryId = "Main category is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate slug from name if empty
    const slug = currentSubCategory.slug || 
      currentSubCategory.name.toLowerCase().replace(/\s+/g, '-');
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      if (isEditing) {
        // Update existing sub-category
        await updateSubCategory(currentSubCategory.id, {
          name: currentSubCategory.name,
          slug,
          category_id: currentSubCategory.categoryId
        });
        
        toast({
          title: "Sub-category updated",
          description: `${currentSubCategory.name} has been successfully updated.`
        });
      } else {
        // Add new sub-category
        await createSubCategory({
          name: currentSubCategory.name,
          slug,
          category_id: currentSubCategory.categoryId
        });
        
        toast({
          title: "Sub-category added",
          description: `${currentSubCategory.name} has been successfully added.`
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving sub-category:", error);
      
      // Handle specific error cases
      if (error.code === "23505") { // Unique constraint violation
        setFormErrors({ 
          slug: "A sub-category with this slug already exists. Please use a different slug." 
        });
      } else if (error.code === "42501") { // Permission denied
        setFormErrors({ 
          general: "You don't have permission to perform this action. Make sure you're logged in with admin privileges." 
        });
      } else if (error.message) {
        setFormErrors({ general: error.message });
      } else {
        setFormErrors({ 
          general: "There was an error saving the sub-category. Please try again." 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get main category name by ID
  const getCategoryName = (id: string): string => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : "Unknown";
  };

  if (isLoading || isCategoriesLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Sub-Categories</h1>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sub-Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-10 w-full sm:max-w-xs flex-1" />
                  <Skeleton className="h-10 sm:w-48" />
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
              <h1 className="text-2xl font-bold">Sub-Categories</h1>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add Sub-Category
              </Button>
            </div>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Error loading sub-categories. Please try again later.</p>
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
            <h1 className="text-2xl font-bold">Sub-Categories</h1>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Sub-Category
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Sub-Category Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="relative sm:max-w-xs flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sub-categories..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="sm:w-48">
                  <Select 
                    value={selectedCategoryFilter} 
                    onValueChange={setSelectedCategoryFilter}
                  >
                    <SelectTrigger>
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
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Main Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          {searchTerm || selectedCategoryFilter !== "all" 
                            ? "No sub-categories found matching your search criteria." 
                            : "No sub-categories found. Add your first sub-category!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubCategories.map((subCategory) => (
                        <TableRow key={subCategory.id}>
                          <TableCell className="font-medium">{subCategory.name}</TableCell>
                          <TableCell>{subCategory.slug}</TableCell>
                          <TableCell>{getCategoryName(subCategory.categoryId)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEdit(subCategory)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDelete(subCategory.id)}
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Sub-Category" : "Add New Sub-Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4 py-4">
                {formErrors.general && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.general}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name" className={formErrors.name ? "text-destructive" : ""}>
                    Name * {formErrors.name && <span className="text-destructive text-sm">({formErrors.name})</span>}
                  </Label>
                  <Input
                    id="name"
                    value={currentSubCategory.name}
                    onChange={(e) => setCurrentSubCategory({...currentSubCategory, name: e.target.value})}
                    placeholder="Sub-category name"
                    required
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className={formErrors.slug ? "text-destructive" : ""}>
                    Slug {formErrors.slug && <span className="text-destructive text-sm">({formErrors.slug})</span>}
                  </Label>
                  <Input
                    id="slug"
                    value={currentSubCategory.slug}
                    onChange={(e) => setCurrentSubCategory({...currentSubCategory, slug: e.target.value})}
                    placeholder="sub-category-slug (leave empty to generate)"
                    className={formErrors.slug ? "border-destructive" : ""}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to auto-generate from the name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainCategory" className={formErrors.categoryId ? "text-destructive" : ""}>
                    Main Category * {formErrors.categoryId && <span className="text-destructive text-sm">({formErrors.categoryId})</span>}
                  </Label>
                  <Select 
                    value={currentSubCategory.categoryId} 
                    onValueChange={(value) => setCurrentSubCategory({...currentSubCategory, categoryId: value})}
                  >
                    <SelectTrigger className={formErrors.categoryId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormErrors({});
                  }} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Update" : "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminSubCategories;
