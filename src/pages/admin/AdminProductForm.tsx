import React, { useState, useEffect } from "react";
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
import { Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useCategories, useSubcategoriesByCategory } from "@/hooks/useCategories";
import { useProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  createProduct, 
  updateProduct, 
  createProductColor, 
  updateProductColor,
  createProductSize, 
  updateProductSize 
} from "@/services/adminApi";
import { Product } from "@/types/product";
import { useQueryClient } from "@tanstack/react-query";

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

interface FormErrors {
  title?: string;
  shortDescription?: string;
  originalPrice?: string;
  mainCategoryId?: string;
  subCategoryId?: string;
  slug?: string;
  general?: string;
}

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  // Fetch data
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: existingProduct, isLoading: isProductLoading } = useProduct(isEditMode ? id : "");
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
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
  const [slug, setSlug] = useState("");
  
  // Fetch subcategories based on selected main category
  const { data: subcategories, isLoading: isSubcategoriesLoading } = useSubcategoriesByCategory(mainCategoryId);
  
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
  
  // Populate form with existing product data if in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      setTitle(existingProduct.title);
      setShortDescription(existingProduct.shortDescription);
      setLongDescription(existingProduct.longDescription);
      setOriginalPrice(existingProduct.price.original.toString());
      setDiscountedPrice(existingProduct.price.discounted?.toString() || "");
      setMainCategoryId(existingProduct.categoryId);
      setSubCategoryId(existingProduct.subCategoryId);
      setIsLowStock(existingProduct.isLowStock);
      setIsOutOfStock(existingProduct.isOutOfStock);
      setSlug(existingProduct.slug);
      
      // Set color variants from existing product
      if (existingProduct.colorVariants.length > 0) {
        setColorVariants(existingProduct.colorVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          colorCode: variant.colorCode,
          images: variant.images || []
        })));
      }
      
      // Set size variants from existing product
      if (existingProduct.sizeVariants.length > 0) {
        setSizeVariants(existingProduct.sizeVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          inStock: variant.inStock
        })));
      }
    }
  }, [isEditMode, existingProduct]);
  
  // Generate slug when title changes
  useEffect(() => {
    if (!isEditMode && title) {
      // Simple slug generation
      const newSlug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setSlug(newSlug);
    }
  }, [title, isEditMode]);
  
  // Validate form input
  const validateForm = () => {
    const errors: FormErrors = {};

    if (!title.trim()) {
      errors.title = "Product title is required";
    } else if (title.length > 100) {
      errors.title = "Title must be 100 characters or less";
    }

    if (!shortDescription.trim()) {
      errors.shortDescription = "Short description is required";
    }

    if (!originalPrice) {
      errors.originalPrice = "Original price is required";
    } else if (isNaN(parseFloat(originalPrice)) || parseFloat(originalPrice) < 0) {
      errors.originalPrice = "Price must be a positive number";
    }

    if (discountedPrice && (isNaN(parseFloat(discountedPrice)) || parseFloat(discountedPrice) < 0)) {
      errors.originalPrice = "Discounted price must be a positive number";
    }

    if (!mainCategoryId) {
      errors.mainCategoryId = "Main category is required";
    }

    if (!subCategoryId) {
      errors.subCategoryId = "Sub-category is required";
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Validate each color variant has a name
    const invalidColorVariant = colorVariants.find(variant => !variant.name.trim());
    if (invalidColorVariant) {
      errors.general = "All color variants must have a name";
    }

    // Validate each size variant has a name
    const invalidSizeVariant = sizeVariants.find(variant => !variant.name.trim());
    if (invalidSizeVariant) {
      errors.general = errors.general ? `${errors.general}. All size variants must have a name` : "All size variants must have a name";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create specifications object from array
      const specsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key && spec.value) {
          specsObj[spec.key] = spec.value;
        }
      });
      
      // Prepare product data
      const productData = {
        title,
        slug,
        short_description: shortDescription,
        long_description: longDescription,
        price_original: parseFloat(originalPrice),
        price_discounted: discountedPrice ? parseFloat(discountedPrice) : null,
        category_id: mainCategoryId,
        subcategory_id: subCategoryId,
        stock_quantity: isOutOfStock ? 0 : isLowStock ? 5 : 100,
        is_featured: false,
        updated_at: new Date().toISOString()
      };
      
      let productId = id;
      
      if (isEditMode) {
        // Update existing product
        await updateProduct(id!, productData);
      } else {
        // Create new product
        const newProduct = await createProduct(productData);
        productId = newProduct.id;
      }
      
      // Handle color variants
      for (const colorVariant of colorVariants) {
        const colorData = {
          product_id: productId,
          name: colorVariant.name,
          color_code: colorVariant.colorCode
        };
        
        if (colorVariant.id.startsWith('color-') || !isEditMode) {
          // New color variant
          await createProductColor(colorData);
        } else {
          // Update existing color variant
          await updateProductColor(colorVariant.id, colorData);
        }
        
        // For a real app, you'd handle actual image uploads to storage here
      }
      
      // Handle size variants
      for (const sizeVariant of sizeVariants) {
        const sizeData = {
          product_id: productId,
          name: sizeVariant.name,
          in_stock: sizeVariant.inStock
        };
        
        if (sizeVariant.id.startsWith('size-') || !isEditMode) {
          // New size variant
          await createProductSize(sizeData);
        } else {
          // Update existing size variant
          await updateProductSize(sizeVariant.id, sizeData);
        }
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      toast({
        title: isEditMode ? "Product Updated" : "Product Created",
        description: `${title} has been successfully ${isEditMode ? 'updated' : 'created'}.`
      });
      
      // Redirect back to products page
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      
      // Handle specific error types
      if (error.code === "23505") { // Unique constraint violation
        setFormErrors({
          slug: "A product with this slug already exists. Please use a different slug."
        });
      } else if (error.code === "42501") { // Permission denied
        setFormErrors({
          general: "You don't have permission to perform this action. Make sure you're logged in with admin privileges."
        });
      } else if (error.message) {
        setFormErrors({
          general: error.message
        });
      } else {
        setFormErrors({
          general: "There was an error saving the product. Please try again."
        });
      }
      
      toast({
        title: "Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Display loading state
  const isLoading = isCategoriesLoading || isSubcategoriesLoading || (isEditMode && isProductLoading);
  
  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
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
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/admin/products")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Create Product"
                )}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {formErrors.general && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}
            
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
                        <Label htmlFor="title" className={formErrors.title ? "text-destructive" : ""}>
                          Product Title * {formErrors.title && <span className="text-destructive text-sm">({formErrors.title})</span>}
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter product title"
                          required
                          className={formErrors.title ? "border-destructive" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="originalPrice" className={formErrors.originalPrice ? "text-destructive" : ""}>
                          Original Price (₹) * {formErrors.originalPrice && <span className="text-destructive text-sm">({formErrors.originalPrice})</span>}
                        </Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="999.00"
                          required
                          className={formErrors.originalPrice ? "border-destructive" : ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mainCategory" className={formErrors.mainCategoryId ? "text-destructive" : ""}>
                          Main Category * {formErrors.mainCategoryId && <span className="text-destructive text-sm">({formErrors.mainCategoryId})</span>}
                        </Label>
                        <Select 
                          value={mainCategoryId} 
                          onValueChange={(value) => {
                            setMainCategoryId(value);
                            setSubCategoryId("");
                          }}
                        >
                          <SelectTrigger className={formErrors.mainCategoryId ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountedPrice">Sale Price (₹)</Label>
                        <Input
                          id="discountedPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountedPrice}
                          onChange={(e) => setDiscountedPrice(e.target.value)}
                          placeholder="799.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subCategory" className={formErrors.subCategoryId ? "text-destructive" : ""}>
                          Sub Category * {formErrors.subCategoryId && <span className="text-destructive text-sm">({formErrors.subCategoryId})</span>}
                        </Label>
                        <Select 
                          value={subCategoryId} 
                          onValueChange={setSubCategoryId}
                          disabled={!mainCategoryId || !subcategories || subcategories.length === 0}
                        >
                          <SelectTrigger className={formErrors.subCategoryId ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories?.map(subCategory => (
                              <SelectItem key={subCategory.id} value={subCategory.id}>
                                {subCategory.name}
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
                      <Label htmlFor="slug" className={formErrors.slug ? "text-destructive" : ""}>
                        Slug (URL path) {formErrors.slug && <span className="text-destructive text-sm">({formErrors.slug})</span>}
                      </Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                        placeholder="product-url-slug"
                        disabled={isEditMode}
                        className={`${isEditMode ? "bg-gray-100" : ""} ${formErrors.slug ? "border-destructive" : ""}`}
                      />
                      <p className="text-xs text-gray-500">
                        This will be used in the product URL. Auto-generated from title if left empty.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription" className={formErrors.shortDescription ? "text-destructive" : ""}>
                        Short Description * {formErrors.shortDescription && <span className="text-destructive text-sm">({formErrors.shortDescription})</span>}
                      </Label>
                      <Textarea
                        id="shortDescription"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief description of the product"
                        rows={2}
                        required
                        className={formErrors.shortDescription ? "border-destructive" : ""}
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

// Add these functions back - they were in the original file
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

export default AdminProductForm;
