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
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useProductById } from "@/hooks/useProducts";
import MediaServerImageUpload from "@/components/admin/MediaServerImageUpload";
import { deleteFromMediaServer, getActiveMediaServerConfig } from "@/services/mediaServerApi";

interface ColorVariant {
  id: string;
  name: string;
  colorCode: string;
  images: Array<{
    url: string;
    filename: string;
    fileType: string;
  }>;
}

interface SizeVariant {
  id: string;
  name: string;
  inStock: boolean;
  priceOriginal: number;
  priceDiscounted?: number;
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

  // Fetch data
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

  // Standardized function to create new color variant with proper image structure
  const createNewColorVariant = (id?: string): ColorVariant => {
    const variantId = id || `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Creating new color variant with ID:', variantId);
    
    return {
      id: variantId,
      name: "",
      colorCode: "#ffffff",
      images: Array(6).fill(null).map((_, index) => {
        console.log(`Initializing image ${index} for variant ${variantId}`);
        return { url: "", filename: "", fileType: "jpg" };
      })
    };
  };

  // Variants with standardized initialization
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    createNewColorVariant("color-1")
  ]);

  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([
    { id: "size-1", name: "S", inStock: true, priceOriginal: 0, priceDiscounted: undefined },
    { id: "size-2", name: "M", inStock: true, priceOriginal: 0, priceDiscounted: undefined },
    { id: "size-3", name: "L", inStock: true, priceOriginal: 0, priceDiscounted: undefined },
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

      // Set color variants from existing product with proper media server structure
      if (existingProduct.colorVariants && existingProduct.colorVariants.length > 0) {
        setColorVariants(existingProduct.colorVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          colorCode: variant.colorCode,
          images: variant.images && Array.isArray(variant.images) 
            ? variant.images.map((img: any) => {
                if (typeof img === 'string') {
                  // Legacy format - convert to new structure
                  return { url: img, filename: "", fileType: "jpg" };
                } else if (img && typeof img === 'object') {
                  // New format - ensure all required properties
                  return { 
                    url: img.url || "", 
                    filename: img.filename || img.media_file_name || "", 
                    fileType: img.fileType || img.media_file_type || "jpg" 
                  };
                }
                return { url: "", filename: "", fileType: "jpg" };
              })
            : Array(6).fill(null).map(() => ({ url: "", filename: "", fileType: "jpg" }))
        })));
      }

      // Set size variants from existing product with pricing
      if (existingProduct.sizeVariants && existingProduct.sizeVariants.length > 0) {
        setSizeVariants(existingProduct.sizeVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          inStock: variant.inStock,
          priceOriginal: variant.priceOriginal || existingProduct.price.original,
          priceDiscounted: variant.priceDiscounted || existingProduct.price.discounted
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

  // Auto-fill size prices when base price changes
  useEffect(() => {
    if (originalPrice && !isEditMode) {
      const basePrice = parseFloat(originalPrice);
      const baseDiscounted = discountedPrice ? parseFloat(discountedPrice) : undefined;
      
      setSizeVariants(prevSizes => 
        prevSizes.map(size => ({
          ...size,
          priceOriginal: size.priceOriginal === 0 ? basePrice : size.priceOriginal,
          priceDiscounted: size.priceDiscounted === undefined ? baseDiscounted : size.priceDiscounted
        }))
      );
    }
  }, [originalPrice, discountedPrice, isEditMode]);

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

    // Validate size pricing
    const invalidSizes = sizeVariants.filter(size => size.name && (!size.priceOriginal || size.priceOriginal <= 0));
    if (invalidSizes.length > 0) {
      toast({
        title: "Validation Error",
        description: "All sizes must have a valid original price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get media server config
      const mediaServerConfig = await getActiveMediaServerConfig();
      if (!mediaServerConfig) {
        throw new Error('No active media server configuration found');
      }

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
          for (let i = 0; i < colorVariant.images.length; i++) {
            const imageData = colorVariant.images[i];
            if (imageData.url && imageData.filename && imageData.fileType) {
              const { error: imageError } = await supabase
                .from('product_images')
                .insert({
                  product_id: productId,
                  color_id: newColor.id,
                  image_url: imageData.url,
                  media_server_api_url_fk: mediaServerConfig.id,
                  media_file_name: imageData.filename,
                  media_file_type: imageData.fileType,
                  is_primary: i === 0
                });
                
              if (imageError) {
                console.error('Error saving image:', imageError);
              }
            }
          }
        }
      }

      // Add size variants with individual pricing
      for (const sizeVariant of sizeVariants) {
        if (sizeVariant.name && sizeVariant.priceOriginal > 0) {
          const sizeData = {
            product_id: productId,
            name: sizeVariant.name,
            in_stock: sizeVariant.inStock,
            price_original: sizeVariant.priceOriginal,
            price_discounted: sizeVariant.priceDiscounted || null
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

  // Standardized function to add a color variant
  const addColorVariant = () => {
    const newVariant = createNewColorVariant();
    console.log('Adding new color variant:', newVariant);
    setColorVariants([...colorVariants, newVariant]);
  };

  // Remove a color variant
  const removeColorVariant = (id: string) => {
    console.log('Removing color variant:', id);
    setColorVariants(colorVariants.filter(variant => variant.id !== id));
  };

  // Update color variant with debugging
  const updateColorVariant = (id: string, field: keyof ColorVariant, value: any) => {
    console.log(`Updating color variant ${id}, field: ${field}`, value);
    setColorVariants(colorVariants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  // Handle image upload with enhanced debugging
  const handleImageUpload = (colorId: string, imageIndex: number, url: string, filename: string, fileType: string) => {
    console.log(`=== IMAGE UPLOAD DEBUG ===`);
    console.log('Target Color ID:', colorId);
    console.log('Image Index:', imageIndex);
    console.log('URL:', url);
    console.log('Filename:', filename);
    console.log('File Type:', fileType);
    console.log('Current Color Variants:', colorVariants.map(v => ({ id: v.id, name: v.name })));
    
    setColorVariants(colorVariants.map(variant => {
      if (variant.id === colorId) {
        console.log(`Updating images for variant: ${variant.id} (${variant.name || 'Unnamed'})`);
        const updatedImages = [...variant.images];
        updatedImages[imageIndex] = { url, filename, fileType };
        console.log('Updated images array:', updatedImages);
        return { ...variant, images: updatedImages };
      }
      return variant;
    }));
    console.log(`=== END IMAGE UPLOAD DEBUG ===`);
  };

  // Remove image with media server cleanup
  const removeImage = async (colorId: string, imageIndex: number) => {
    console.log(`Removing image ${imageIndex} from color variant ${colorId}`);
    const variant = colorVariants.find(v => v.id === colorId);
    if (variant && variant.images[imageIndex]) {
      const imageData = variant.images[imageIndex];
      
      // Delete from media server if it has filename and fileType
      if (imageData.filename && imageData.fileType) {
        await deleteFromMediaServer(imageData.filename, imageData.fileType);
      }

      // Update state
      setColorVariants(colorVariants.map(v => {
        if (v.id === colorId) {
          const updatedImages = [...v.images];
          updatedImages[imageIndex] = { url: "", filename: "", fileType: "" };
          return { ...v, images: updatedImages };
        }
        return v;
      }));
    }
  };

  // Add a size variant
  const addSizeVariant = () => {
    const basePrice = parseFloat(originalPrice) || 0;
    const baseDiscounted = discountedPrice ? parseFloat(discountedPrice) : undefined;
    
    setSizeVariants([
      ...sizeVariants,
      { 
        id: `size-${Date.now()}`, 
        name: "", 
        inStock: true, 
        priceOriginal: basePrice,
        priceDiscounted: baseDiscounted
      }
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

  // Enhanced Color Variants Tab with better visual distinction
  const renderColorVariantsTab = () => (
    <TabsContent value="colors">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Color Variants</CardTitle>
          <Button onClick={addColorVariant} type="button" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Color
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {colorVariants.map((variant, index) => (
              <div 
                key={variant.id} 
                className="border-2 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white"
                style={{ 
                  borderColor: variant.colorCode || '#e5e7eb',
                  boxShadow: `0 2px 8px ${variant.colorCode}20`
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      Color Variant #{index + 1}
                    </h3>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: variant.colorCode }}
                      title={`Color: ${variant.name || 'Unnamed'}`}
                    />
                    {variant.name && (
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {variant.name}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => removeColorVariant(variant.id)}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={colorVariants.length === 1}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
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

                {/* Enhanced Image Upload Section */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium mb-4 text-gray-700">
                    Images for {variant.name || `Color #${index + 1}`}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }, (_, imgIndex) => (
                      <div key={`${variant.id}-img-${imgIndex}`} className="relative">
                        <MediaServerImageUpload
                          key={`${variant.id}-${imgIndex}`}
                          label={`${variant.name || `Color #${index + 1}`} - Image ${imgIndex + 1}`}
                          value={variant.images[imgIndex]?.url || ''}
                          filename={variant.images[imgIndex]?.filename}
                          fileType={variant.images[imgIndex]?.fileType}
                          onChange={(url, filename, fileType) => {
                            handleImageUpload(variant.id, imgIndex, url, filename, fileType);
                          }}
                          onRemove={() => removeImage(variant.id, imgIndex)}
                        />
                        {/* Debug indicator */}
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">
                          {variant.id.slice(-4)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );

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
                <TabsTrigger value="sizes">Size Variants & Pricing</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longDescription">Long Description</Label>
                    <Textarea
                      id="longDescription"
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originalPrice">Base Original Price</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">This will be used as default for all sizes</p>
                    </div>
                    <div>
                      <Label htmlFor="discountedPrice">Base Discounted Price</Label>
                      <Input
                        id="discountedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountedPrice}
                        onChange={(e) => setDiscountedPrice(e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">Optional default discount for all sizes</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mainCategory">Main Category</Label>
                      <Select
                        value={mainCategoryId}
                        onValueChange={(value) => setMainCategoryId(value)}
                      >
                        <SelectTrigger id="mainCategory">
                          <SelectValue placeholder="Select category" />
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
                    <div>
                      <Label htmlFor="subCategory">Subcategory</Label>
                      <Select
                        value={subCategoryId}
                        onValueChange={(value) => setSubCategoryId(value)}
                        disabled={!mainCategoryId}
                      >
                        <SelectTrigger id="subCategory">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Label>Age Ranges</Label>
                    {AGE_RANGES.map((ageRange) => (
                      <div key={ageRange} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ageRange-${ageRange}`}
                          checked={selectedAgeRanges.includes(ageRange)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAgeRanges([...selectedAgeRanges, ageRange]);
                            } else {
                              setSelectedAgeRanges(selectedAgeRanges.filter(a => a !== ageRange));
                            }
                          }}
                        />
                        <Label htmlFor={`ageRange-${ageRange}`}>{ageRange}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isLowStock"
                        checked={isLowStock}
                        onCheckedChange={setIsLowStock}
                      />
                      <Label htmlFor="isLowStock">Low Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOutOfStock"
                        checked={isOutOfStock}
                        onCheckedChange={setIsOutOfStock}
                      />
                      <Label htmlFor="isOutOfStock">Out of Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isTrending"
                        checked={isTrending}
                        onCheckedChange={setIsTrending}
                      />
                      <Label htmlFor="isTrending">Trending</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Color Variants Tab */}
              {renderColorVariantsTab()}

              {/* Enhanced Size Variants Tab with Pricing */}
              <TabsContent value="sizes">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Size Variants & Pricing</CardTitle>
                    <Button onClick={addSizeVariant} type="button" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Size
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sizeVariants.map((variant, index) => (
                        <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-5 gap-4 items-end">
                            <div>
                              <Label htmlFor={`size-name-${variant.id}`}>Size Name</Label>
                              <Input
                                id={`size-name-${variant.id}`}
                                value={variant.name}
                                onChange={(e) => updateSizeVariant(variant.id, "name", e.target.value)}
                                placeholder="Size name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`size-price-${variant.id}`}>Original Price</Label>
                              <Input
                                id={`size-price-${variant.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.priceOriginal}
                                onChange={(e) => updateSizeVariant(variant.id, "priceOriginal", parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`size-discount-${variant.id}`}>Discounted Price</Label>
                              <Input
                                id={`size-discount-${variant.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.priceDiscounted || ''}
                                onChange={(e) => updateSizeVariant(variant.id, "priceDiscounted", e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`size-stock-${variant.id}`}
                                checked={variant.inStock}
                                onCheckedChange={(checked) => updateSizeVariant(variant.id, "inStock", checked)}
                              />
                              <Label htmlFor={`size-stock-${variant.id}`}>In Stock</Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSizeVariant(variant.id)}
                              disabled={sizeVariants.length === 1}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Pricing Tips:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Each size can have its own unique pricing</li>
                        <li>• Base prices from the Basic Info tab will auto-fill new sizes</li>
                        <li>• Original price is required for all sizes</li>
                        <li>• Discounted price is optional and will show as sale price</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Specifications Tab */}
              <TabsContent value="specifications">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Specifications</CardTitle>
                    <Button onClick={addSpecification} type="button" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Specification
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Input
                            value={spec.key}
                            onChange={(e) => updateSpecification(index, "key", e.target.value)}
                            placeholder="Key"
                            className="flex-1"
                          />
                          <Input
                            value={spec.value}
                            onChange={(e) => updateSpecification(index, "value", e.target.value)}
                            placeholder="Value"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpecification(index)}
                            disabled={specifications.length === 1}
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
