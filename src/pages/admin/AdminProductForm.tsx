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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useProductById } from "@/hooks/useProducts";

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

// Common age ranges for kids
const AGE_RANGES = [
  "0-6 months",
  "6-12 months",
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-9 years",
  "9-10 years",
  "10+ years"
];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch data - use useProductById for admin edit functionality
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: existingProduct, isLoading: isProductLoading } = useProductById(isEditMode ? id! : "");

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [slug, setSlug] = useState("");
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);

  // Get subcategories for selected category
  const selectedCategory = categories.find(cat => cat.id === mainCategoryId);
  const subcategories = selectedCategory?.subCategories || [];

  // Variants
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { id: "color-1", name: "Black", colorCode: "#000000", images: [] }
  ]);

  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([
    { id: "size-1", name: "S", inStock: true },
    { id: "size-2", name: "M", inStock: true },
    { id: "size-3", name: "L", inStock: true },
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
      setLongDescription(existingProduct.longDescription || "");
      setOriginalPrice(existingProduct.price.original.toString());
      setDiscountedPrice(existingProduct.price.discounted?.toString() || "");
      setMainCategoryId(existingProduct.categoryId);
      setSubCategoryId(existingProduct.subCategoryId);
      setIsLowStock(existingProduct.isLowStock);
      setIsOutOfStock(existingProduct.isOutOfStock);
      setIsFeatured(existingProduct.isFeatured || false);
      setIsTrending(existingProduct.isTrending || false);
      setSlug(existingProduct.slug);
      setSelectedAgeRanges(existingProduct.ageRanges || []);

      // Set color variants from existing product
      if (existingProduct.colorVariants && existingProduct.colorVariants.length > 0) {
        setColorVariants(existingProduct.colorVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          colorCode: variant.colorCode,
          images: variant.images || []
        })));
      }

      // Set size variants from existing product
      if (existingProduct.sizeVariants && existingProduct.sizeVariants.length > 0) {
        setSizeVariants(existingProduct.sizeVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          inStock: variant.inStock
        })));
      }

      // Set specifications from existing product
      if (existingProduct.specifications) {
        if (Array.isArray(existingProduct.specifications)) {
          setSpecifications(existingProduct.specifications.map((spec, index) => ({
            key: `Specification ${index + 1}`,
            value: spec
          })));
        } else if (typeof existingProduct.specifications === 'object') {
          setSpecifications(Object.entries(existingProduct.specifications).map(([key, value]) => ({
            key,
            value: value as string
          })));
        }
      }
    }
  }, [isEditMode, existingProduct]);

  // Generate slug when title changes
  useEffect(() => {
    if (!isEditMode && title) {
      const newSlug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setSlug(newSlug);
    }
  }, [title, isEditMode]);

  // Convert file to base64 data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Toggle age range selection
  const toggleAgeRange = (ageRange: string) => {
    setSelectedAgeRanges(prev =>
      prev.includes(ageRange)
        ? prev.filter(ar => ar !== ageRange)
        : [...prev, ageRange]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
        is_featured: isFeatured,
        is_trending: isTrending,
        is_low_stock: isLowStock,
        is_out_of_stock: isOutOfStock,
        age_ranges: selectedAgeRanges,
        specifications: specsObj,
        updated_at: new Date().toISOString()
      };

      let productId = id;
      
      if (isEditMode) {
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
          
        if (productError) throw productError;
        productId = id;
        
        toast({
          title: "Product Updated",
          description: `${title} has been successfully updated.`
        });
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
          
        if (productError) throw productError;
        productId = newProduct.id;
        
        toast({
          title: "Product Created",
          description: `${title} has been successfully created.`
        });
      }

      // Handle color variants and images
      if (isEditMode) {
        // For edit mode, delete existing variants and recreate them
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_colors').delete().eq('product_id', productId);
        await supabase.from('product_sizes').delete().eq('product_id', productId);
      }

      // Add color variants
      for (const colorVariant of colorVariants) {
        if (colorVariant.name && colorVariant.colorCode) {
          const colorData = {
            product_id: productId,
            name: colorVariant.name,
            color_code: colorVariant.colorCode
          };

          const { data: newColor, error: colorError } = await supabase
            .from('product_colors')
            .insert(colorData)
            .select()
            .single();
            
          if (colorError) throw colorError;

          // Handle images for this color
          for (const imageUrl of colorVariant.images) {
            if (imageUrl) {
              const { error: imageError } = await supabase
                .from('product_images')
                .insert({
                  product_id: productId,
                  color_id: newColor.id,
                  image_url: imageUrl,
                  is_primary: colorVariant.images.indexOf(imageUrl) === 0
                });
                
              if (imageError) {
                console.error('Error saving image:', imageError);
              }
            }
          }
        }
      }

      // Add size variants
      for (const sizeVariant of sizeVariants) {
        if (sizeVariant.name) {
          const sizeData = {
            product_id: productId,
            name: sizeVariant.name,
            in_stock: sizeVariant.inStock
          };

          const { error: sizeError } = await supabase
            .from('product_sizes')
            .insert(sizeData);
            
          if (sizeError) throw sizeError;
        }
      }

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Redirect back to products page
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "There was an error saving the product. Please try again.",
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

  // Handle image upload - convert to data URL for persistence
  const handleImageUpload = async (colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const dataUrls: string[] = [];

      try {
        for (const file of files) {
          const dataUrl = await fileToDataURL(file);
          dataUrls.push(dataUrl);
        }

        setColorVariants(colorVariants.map(variant => {
          if (variant.id === colorId) {
            // Limit to 6 images
            const currentImages = [...variant.images];
            const newImages = [...currentImages, ...dataUrls].slice(0, 6);
            return { ...variant, images: newImages };
          }
          return variant;
        }));
      } catch (error) {
        console.error('Error converting files to data URLs:', error);
        toast({
          title: "Error",
          description: "Failed to process images. Please try again.",
          variant: "destructive"
        });
      }
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
  const isLoading = isCategoriesLoading || (isEditMode && isProductLoading);

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
                        <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="999.00"
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
                        <Label htmlFor="subCategory">Sub Category *</Label>
                        <Select 
                          value={subCategoryId} 
                          onValueChange={setSubCategoryId}
                          disabled={!mainCategoryId || !subcategories || subcategories.length === 0}
                        >
                          <SelectTrigger>
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
                            id="featured"
                            checked={isFeatured}
                            onCheckedChange={setIsFeatured}
                          />
                          <Label htmlFor="featured">Featured</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="trending"
                            checked={isTrending}
                            onCheckedChange={setIsTrending}
                          />
                          <Label htmlFor="trending">Trending</Label>
                        </div>
                      </div>
                    </div>

                    {/* Age Ranges Selection */}
                    <div className="space-y-2">
                      <Label>Age Ranges</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {AGE_RANGES.map((ageRange) => (
                          <div key={ageRange} className="flex items-center space-x-2">
                            <Checkbox
                              id={`age-${ageRange}`}
                              checked={selectedAgeRanges.includes(ageRange)}
                              onCheckedChange={() => toggleAgeRange(ageRange)}
                            />
                            <Label htmlFor={`age-${ageRange}`} className="text-sm">
                              {ageRange}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Select all applicable age ranges for this product
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL path)</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                        placeholder="product-url-slug"
                        disabled={isEditMode}
                        className={isEditMode ? "bg-gray-100" : ""}
                      />
                      <p className="text-xs text-gray-500">
                        This will be used in the product URL. Auto-generated from title if left empty.
                      </p>
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
