
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { toast } from "sonner";

// Main categories as defined
const mainCategories = [
  { id: "1", name: "Boys", slug: "boys" },
  { id: "2", name: "Girls", slug: "girls" },
  { id: "3", name: "Toys", slug: "toys" },
  { id: "4", name: "Shoes", slug: "shoes" },
  { id: "5", name: "Accessories", slug: "accessories" },
  { id: "6", name: "New Born", slug: "new-born" },
];

// Mock data for sub-categories
const initialSubCategories = [
  { id: "101", name: "T-Shirts", slug: "t-shirts", mainCategoryId: "1" },
  { id: "102", name: "Jeans", slug: "jeans", mainCategoryId: "1" },
  { id: "201", name: "Dresses", slug: "dresses", mainCategoryId: "2" },
  { id: "202", name: "Skirts", slug: "skirts", mainCategoryId: "2" },
  { id: "301", name: "Action Figures", slug: "action-figures", mainCategoryId: "3" },
  { id: "302", name: "Board Games", slug: "board-games", mainCategoryId: "3" },
  { id: "401", name: "Sneakers", slug: "sneakers", mainCategoryId: "4" },
  { id: "402", name: "Boots", slug: "boots", mainCategoryId: "4" },
  { id: "501", name: "Hats", slug: "hats", mainCategoryId: "5" },
  { id: "502", name: "Jewelry", slug: "jewelry", mainCategoryId: "5" },
  { id: "601", name: "Onesies", slug: "onesies", mainCategoryId: "6" },
  { id: "602", name: "Bibs", slug: "bibs", mainCategoryId: "6" },
];

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  mainCategoryId: string;
}

const AdminSubCategories = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>(initialSubCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // For the add/edit form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory>({
    id: "",
    name: "",
    slug: "",
    mainCategoryId: ""
  });

  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = 
      subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCategory.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategoryFilter === "all" || 
      subCategory.mainCategoryId === selectedCategoryFilter;
      
    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentSubCategory({
      id: "",
      name: "",
      slug: "",
      mainCategoryId: ""
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (subCategory: SubCategory) => {
    setIsEditing(true);
    setCurrentSubCategory({...subCategory});
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // In a real app, you would make an API call to delete the sub-category
    setSubCategories(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Sub-category deleted",
      description: "The sub-category has been successfully removed."
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSubCategory.name || !currentSubCategory.mainCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Generate slug from name if empty
    const slug = currentSubCategory.slug || 
      currentSubCategory.name.toLowerCase().replace(/\s+/g, '-');
    
    if (isEditing) {
      // Update existing sub-category
      setSubCategories(prev => 
        prev.map(item => 
          item.id === currentSubCategory.id 
            ? {...currentSubCategory, slug} 
            : item
        )
      );
      toast({
        title: "Sub-category updated",
        description: `${currentSubCategory.name} has been successfully updated.`
      });
    } else {
      // Add new sub-category
      const newId = `sc-${Date.now()}`;
      setSubCategories(prev => [
        ...prev,
        {...currentSubCategory, id: newId, slug}
      ]);
      toast({
        title: "Sub-category added",
        description: `${currentSubCategory.name} has been successfully added.`
      });
    }
    
    setIsDialogOpen(false);
  };

  // Helper function to get main category name by ID
  const getMainCategoryName = (id: string): string => {
    const category = mainCategories.find(cat => cat.id === id);
    return category ? category.name : "Unknown";
  };

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
                      {mainCategories.map((category) => (
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
                          No sub-categories found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubCategories.map((subCategory) => (
                        <TableRow key={subCategory.id}>
                          <TableCell className="font-medium">{subCategory.name}</TableCell>
                          <TableCell>{subCategory.slug}</TableCell>
                          <TableCell>{getMainCategoryName(subCategory.mainCategoryId)}</TableCell>
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
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentSubCategory.name}
                    onChange={(e) => setCurrentSubCategory({...currentSubCategory, name: e.target.value})}
                    placeholder="Sub-category name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={currentSubCategory.slug}
                    onChange={(e) => setCurrentSubCategory({...currentSubCategory, slug: e.target.value})}
                    placeholder="sub-category-slug (leave empty to generate)"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to auto-generate from the name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainCategory">Main Category *</Label>
                  <Select 
                    value={currentSubCategory.mainCategoryId} 
                    onValueChange={(value) => setCurrentSubCategory({...currentSubCategory, mainCategoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update" : "Create"}
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
