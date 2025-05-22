
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

// Mock data for categories
const mainCategories = [
  { id: "1", name: "Clothing" },
  { id: "2", name: "Footwear" },
  { id: "3", name: "Accessories" },
  { id: "4", name: "Home Goods" },
  { id: "5", name: "Electronics" },
  { id: "6", name: "Beauty" },
];

const subCategoriesByMain: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "101", name: "T-Shirts" },
    { id: "102", name: "Bottoms" },
    { id: "103", name: "Outerwear" },
  ],
  "2": [
    { id: "201", name: "Sneakers" },
    { id: "202", name: "Boots" },
    { id: "203", name: "Sandals" },
  ],
  // Add more subcategories for other main categories
};

interface ColorVariant {
  id: string;
  name: string;
  colorCode: string;
  images: string[];
}

interface SizeVariant {
  id: string;
  name: string;
  inStock: boolean;
}

interface Specification {
  key: string;
  value: string;
}

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Basic product info
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [isLowStock, setIsLowStock] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  
  // Variants
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { id: "1", name: "Black", colorCode: "#000000", images: [] }
  ]);
  
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([
    { id: "1", name: "S", inStock: true },
    { id: "2", name: "M", inStock: true },
    { id: "3", name: "L", inStock: true },
  ]);
  
  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: "Material", value: "" },
    { key: "Care Instructions", value: "" },
  ]);

  // Available subcategories based on main category
  const availableSubCategories = mainCategoryId ? subCategoriesByMain[mainCategoryId] || [] : [];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !shortDescription || !originalPrice || !mainCategoryId || !subCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would make an API call to save the product
    toast({
      title: `Product ${isEditMode ? 'Updated' : 'Created'}`,
      description: `${title} has been successfully ${isEditMode ? 'updated' : 'created'}.`,
    });
    
    navigate("/admin/products");
  };

  // Add a color variant
  const addColorVariant = () => {
    setColorVariants([
      ...colorVariants, 
      { 
        id: `color-${Date.now()}`, 
        name: "", 
        colorCode: "#ffffff", 
        images: [] 
      }
    ]);
  };

  // Remove a color variant
  const removeColorVariant = (id: string) => {
    setColorVariants(colorVariants.filter(variant => variant.id !== id));
  };

  // Update color variant
  const updateColorVariant = (id: string, field: keyof ColorVariant, value: any) => {
    setColorVariants(colorVariants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  // Handle image upload
  const handleImageUpload = (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageUrls = Array.from(e.target.files).map(file => 
        URL.createObjectURL(file)
      );
      
      setColorVariants(colorVariants.map(variant => {
        if (variant.id === colorId) {
          // Limit to 6 images
          const currentImages = [...variant.images];
          const newImages = [...currentImages, ...imageUrls].slice(0, 6);
          return { ...variant, images: newImages };
        }
        return variant;
      }));
    }
  };

  // Remove image
  const removeImage = (colorId: string, imageUrl: string) => {
    setColorVariants(colorVariants.map(variant => {
      if (variant.id === colorId) {
        return {
          ...variant,
          images: variant.images.filter(img => img !== imageUrl)
        };
      }
      return variant;
    }));
  };

  // Add a size variant
  const addSizeVariant = () => {
    setSizeVariants([
      ...sizeVariants,
      { id: `size-${Date.now()}`, name: "", inStock: true }
    ]);
  };

  // Remove a size variant
  const removeSizeVariant = (id: string) => {
    setSizeVariants(sizeVariants.filter(variant => variant.id !== id));
  };

  // Update size variant
  const updateSizeVariant = (id: string, field: keyof SizeVariant, value: any) => {
    setSizeVariants(sizeVariants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  // Add a specification
  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { key: "", value: "" }
    ]);
  };

  // Remove a specification
  const removeSpecification = (index: number) => {
    const newSpecifications = [...specifications];
    newSpecifications.splice(index, 1);
    setSpecifications(newSpecifications);
  };

  // Update specification
  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    const newSpecifications = [...specifications];
    newSpecifications[index] = {
      ...newSpecifications[index],
      [field]: value
    };
    setSpecifications(newSpecifications);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/products")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>

          <form>
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="colors">Color Variants</TabsTrigger>
                <TabsTrigger value="sizes">Size Variants</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Product Title *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter product title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price ($) *</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="29.99"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mainCategory">Main Category *</Label>
                        <Select 
                          value={mainCategoryId} 
                          onValueChange={(value) => {
                            setMainCategoryId(value);
                            setSubCategoryId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountedPrice">Sale Price ($)</Label>
                        <Input
                          id="discountedPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountedPrice}
                          onChange={(e) => setDiscountedPrice(e.target.value)}
                          placeholder="24.99"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subCategory">Sub Category *</Label>
                        <Select 
                          value={subCategoryId} 
                          onValueChange={setSubCategoryId}
                          disabled={!mainCategoryId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-end gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="low-stock"
                            checked={isLowStock}
                            onCheckedChange={setIsLowStock}
                          />
                          <Label htmlFor="low-stock">Low Stock</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="out-of-stock"
                            checked={isOutOfStock}
                            onCheckedChange={setIsOutOfStock}
                          />
                          <Label htmlFor="out-of-stock">Out of Stock</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description *</Label>
                      <Textarea
                        id="shortDescription"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief description of the product"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longDescription">Long Description</Label>
                      <Textarea
                        id="longDescription"
                        value={longDescription}
                        onChange={(e) => setLongDescription(e.target.value)}
                        placeholder="Detailed product description"
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Color Variants Tab */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Color Variants</CardTitle>
                    <Button onClick={addColorVariant} type="button" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Color
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {colorVariants.map((variant, index) => (
                        <div key={variant.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Color #{index + 1}</h3>
                            <Button
                              onClick={() => removeColorVariant(variant.id)}
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={colorVariants.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label htmlFor={`color-name-${variant.id}`}>Color Name</Label>
                              <Input
                                id={`color-name-${variant.id}`}
                                value={variant.name}
                                onChange={(e) => updateColorVariant(variant.id, "name", e.target.value)}
                                placeholder="e.g. Navy Blue"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`color-code-${variant.id}`}>Color Code</Label>
                              <div className="flex gap-2 items-center">
                                <Input
                                  id={`color-code-${variant.id}`}
                                  type="color"
                                  value={variant.colorCode}
                                  onChange={(e) => updateColorVariant(variant.id, "colorCode", e.target.value)}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={variant.colorCode}
                                  onChange={(e) => updateColorVariant(variant.id, "colorCode", e.target.value)}
                                  placeholder="#000000"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Images (up to 6)</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageUpload(variant.id, e)}
                              disabled={variant.images.length >= 6}
                            />
                            <p className="text-xs text-gray-500">
                              {variant.images.length}/6 images uploaded
                            </p>
                          </div>

                          {variant.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              {variant.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="relative">
                                  <img
                                    src={image}
                                    alt={`Color ${variant.name} - Image ${imgIndex + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={() => removeImage(variant.id, image)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Size Variants Tab */}
              <TabsContent value="sizes">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Size Variants</CardTitle>
                    <Button onClick={addSizeVariant} type="button" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Size
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sizeVariants.map((variant) => (
                        <div key={variant.id} className="border rounded-md p-4 flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <Input
                              value={variant.name}
                              onChange={(e) => updateSizeVariant(variant.id, "name", e.target.value)}
                              placeholder="Size name (S, M, L, XL, etc.)"
                              className="w-20"
                            />
                            <div className="flex items-center">
                              <Switch
                                id={`size-stock-${variant.id}`}
                                checked={variant.inStock}
                                onCheckedChange={(checked) => updateSizeVariant(variant.id, "inStock", checked)}
                              />
                              <Label htmlFor={`size-stock-${variant.id}`} className="ml-2">
                                In Stock
                              </Label>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeSizeVariant(variant.id)}
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={sizeVariants.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Specifications Tab */}
              <TabsContent value="specifications">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Technical Specifications</CardTitle>
                    <Button onClick={addSpecification} type="button" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Specification
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <Input
                            value={spec.key}
                            onChange={(e) => updateSpecification(index, "key", e.target.value)}
                            placeholder="Specification name"
                            className="w-1/3"
                          />
                          <Input
                            value={spec.value}
                            onChange={(e) => updateSpecification(index, "value", e.target.value)}
                            placeholder="Specification value"
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeSpecification(index)}
                            type="button"
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminProductForm;
