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
import ReorderableImageGrid from "@/components/admin/ReorderableImageGrid";
import { deleteFromMediaServer, getActiveMediaServerConfig } from "@/services/mediaServerApi";

// Utility function to generate proper UUID
const generateUUID = () => {
  return crypto.randomUUID();
};

interface ColorVariant {
  id: string;
  name: string;
  colorCode: string;
  images: Array<{
    id?: string; // Database ID for existing images
    url: string;
    filename: string;
    fileType: string;
  }>;
  isExisting?: boolean; // Track if this is an existing variant from DB
}

interface SizeVariant {
  id: string;
  name: string;
  inStock: boolean;
  priceOriginal: number;
  priceDiscounted?: number;
  isExisting?: boolean; // Track if this is an existing variant from DB
}

interface Specification {
  key: string;
  value: string;
}

// Common age ranges for kids
const AGE_RANGES = [
  "0-3 months",
  "3-6 months",
  "6-9 months",
  "9-12 months",
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
  
  // Basic product info with proper defaults
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

  // Function to create new color variant with proper UUID
  const createNewColorVariant = (): ColorVariant => {
    const variantId = generateUUID();
    console.log('Creating new color variant with UUID:', variantId);
    
    return {
      id: variantId,
      name: "",
      colorCode: "#ffffff",
      images: Array(6).fill(null).map(() => ({
        url: "",
        filename: "",
        fileType: "jpg"
      })),
      isExisting: false
    };
  };

  // Initialize variants with proper structure
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([createNewColorVariant()]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([
    { id: generateUUID(), name: "S", inStock: true, priceOriginal: 0, priceDiscounted: undefined, isExisting: false },
    { id: generateUUID(), name: "M", inStock: true, priceOriginal: 0, priceDiscounted: undefined, isExisting: false },
    { id: generateUUID(), name: "L", inStock: true, priceOriginal: 0, priceDiscounted: undefined, isExisting: false },
  ]);

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: "Material", value: "" },
    { key: "Care Instructions", value: "" },
  ]);

  // Enhanced data population with better error handling and debugging
  useEffect(() => {
    if (isEditMode && existingProduct) {
      console.log('Loading existing product data for edit mode:', existingProduct);
      
      try {
        // Basic product info
        setTitle(existingProduct.title || "");
        setShortDescription(existingProduct.shortDescription || "");
        setLongDescription(existingProduct.longDescription || "");
        setOriginalPrice(existingProduct.price?.original?.toString() || "");
        setDiscountedPrice(existingProduct.price?.discounted?.toString() || "");
        setMainCategoryId(existingProduct.categoryId || "");
        setSubCategoryId(existingProduct.subCategoryId || "");
        setIsLowStock(existingProduct.isLowStock || false);
        setIsOutOfStock(existingProduct.isOutOfStock || false);
        setIsFeatured(existingProduct.isFeatured || false);
        setIsTrending(existingProduct.isTrending || false);
        setSlug(existingProduct.slug || "");
        setSelectedAgeRanges(existingProduct.ageRanges || []);

        // Handle color variants with enhanced error handling and proper image structure
        if (existingProduct.colorVariants && Array.isArray(existingProduct.colorVariants) && existingProduct.colorVariants.length > 0) {
          console.log('Processing existing color variants:', existingProduct.colorVariants);
          
          const loadedColorVariants = existingProduct.colorVariants.map((variant: any) => {
            console.log('Processing variant:', variant);
            
            // Handle images based on their structure
            const images = Array(6).fill(null).map((_, index) => {
              const existingImage = variant.images && variant.images[index];
              
              if (existingImage) {
                // Check if it's already in the correct format (admin context)
                if (typeof existingImage === 'object' && existingImage.url) {
                  return {
                    id: existingImage.id || undefined,
                    url: existingImage.url,
                    filename: existingImage.filename || '',
                    fileType: existingImage.fileType || 'jpg'
                  };
                }
                // Handle legacy format or string URLs
                else if (typeof existingImage === 'string') {
                  return {
                    url: existingImage,
                    filename: '',
                    fileType: 'jpg'
                  };
                }
              }
              
              return { url: "", filename: "", fileType: "jpg" };
            });

            return {
              id: variant.id || generateUUID(),
              name: variant.name || "",
              colorCode: variant.colorCode || "#ffffff",
              isExisting: true,
              images: images
            };
          });
          
          console.log('Loaded color variants with proper image structure:', loadedColorVariants);
          setColorVariants(loadedColorVariants);
        } else {
          console.log('No existing color variants found, creating default variant');
          // If no color variants exist, create a default one
          setColorVariants([createNewColorVariant()]);
        }

        // Handle size variants - extract from all color variants
        const allSizes: SizeVariant[] = [];
        if (existingProduct.colorVariants && Array.isArray(existingProduct.colorVariants)) {
          console.log('Extracting sizes from color variants:', existingProduct.colorVariants);
          
          // Collect unique sizes from all colors
          const seenSizes = new Map<string, SizeVariant>();
          
          existingProduct.colorVariants.forEach((colorVariant: any) => {
            if (colorVariant.sizes && Array.isArray(colorVariant.sizes)) {
              colorVariant.sizes.forEach((size: any) => {
                if (!seenSizes.has(size.name)) {
                  seenSizes.set(size.name, {
                    id: size.id || generateUUID(),
                    name: size.name || "",
                    inStock: size.inStock !== false,
                    priceOriginal: size.priceOriginal || existingProduct.price?.original || 0,
                    priceDiscounted: size.priceDiscounted || existingProduct.price?.discounted || undefined,
                    isExisting: true
                  });
                }
              });
            }
          });
          
          const loadedSizeVariants = Array.from(seenSizes.values());
          console.log('Loaded size variants:', loadedSizeVariants);
          setSizeVariants(loadedSizeVariants);
        } else {
          console.log('No existing color variants or sizes found, using defaults');
          // Keep default size variants if none exist
        }

        // Load specifications with better handling
        if (existingProduct.specifications) {
          let loadedSpecs: Specification[] = [];
          if (Array.isArray(existingProduct.specifications)) {
            loadedSpecs = existingProduct.specifications.map((spec: any, index: number) => ({
              key: `Specification ${index + 1}`,
              value: typeof spec === 'string' ? spec : spec.value || ""
            }));
          } else if (typeof existingProduct.specifications === 'object') {
            loadedSpecs = Object.entries(existingProduct.specifications).map(([key, value]) => ({
              key,
              value: value as string
            }));
          }
          if (loadedSpecs.length > 0) {
            setSpecifications(loadedSpecs);
          }
        }

        console.log('Successfully loaded all product data for editing');

      } catch (error) {
        console.error('Error loading existing product data:', error);
        toast({
          title: "Warning",
          description: "Some product data could not be loaded properly. Please verify all fields.",
          variant: "destructive"
        });
      }
    }
  }, [isEditMode, existingProduct]);

  // Generate slug when title changes (only for new products)
  useEffect(() => {
    if (!isEditMode && title) {
      const newSlug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setSlug(newSlug);
    }
  }, [title, isEditMode]);

  // Auto-fill size prices when base price changes (only for new products)
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

  // Comprehensive form validation
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!title.trim()) errors.push("Title is required");
    if (!shortDescription.trim()) errors.push("Short description is required");
    if (!originalPrice || parseFloat(originalPrice) <= 0) errors.push("Valid original price is required");
    if (!mainCategoryId) errors.push("Main category is required");
    if (!subCategoryId) errors.push("Subcategory is required");
    if (!slug.trim()) errors.push("Slug is required");

    // Validate color variants
    const validColorVariants = colorVariants.filter(v => v.name.trim() && v.colorCode);
    if (validColorVariants.length === 0) {
      errors.push("At least one color variant with name and color code is required");
    }

    // Validate size variants
    const validSizeVariants = sizeVariants.filter(v => v.name.trim() && v.priceOriginal > 0);
    if (validSizeVariants.length === 0) {
      errors.push("At least one size variant with name and valid price is required");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Simplified form submission with proper error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting form submission...');
      
      // Get media server config
      const mediaServerConfig = await getActiveMediaServerConfig();
      if (!mediaServerConfig) {
        throw new Error('No active media server configuration found');
      }

      // Create specifications object
      const specsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key && spec.value) {
          specsObj[spec.key] = spec.value;
        }
      });

      // Prepare product data
      const productData = {
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim(),
        long_description: longDescription.trim() || null,
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
        console.log('Updating existing product...');
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
          
        if (productError) throw productError;
        productId = id;
      } else {
        console.log('Creating new product...');
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
          
        if (productError) throw productError;
        productId = newProduct.id;
      }

      // Handle color variants with simplified logic
      console.log('Processing color variants...');
      
      if (isEditMode) {
        // For edit mode: Clear existing variants and recreate
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_colors').delete().eq('product_id', productId);
      }

      // Process valid color variants
      const validColorVariants = colorVariants.filter(v => v.name.trim() && v.colorCode);
      for (const colorVariant of validColorVariants) {
        console.log('Processing color variant:', colorVariant.name);
        
        const colorData = {
          product_id: productId,
          name: colorVariant.name.trim(),
          color_code: colorVariant.colorCode
        };

        const { data: newColor, error: colorError } = await supabase
          .from('product_colors')
          .insert(colorData)
          .select()
          .single();
          
        if (colorError) {
          console.error('Error creating color variant:', colorError);
          throw colorError;
        }

        // Handle images for this color with display_order
        for (let i = 0; i < colorVariant.images.length; i++) {
          const imageData = colorVariant.images[i];
          if (imageData.url && imageData.filename && imageData.fileType) {
            console.log(`Saving image ${i + 1} for color ${colorVariant.name} with display_order ${i}`);
            
            const { error: imageError } = await supabase
              .from('product_images')
              .insert({
                product_id: productId,
                color_id: newColor.id,
                image_url: imageData.url,
                media_server_api_url_fk: mediaServerConfig.id,
                media_file_name: imageData.filename,
                media_file_type: imageData.fileType,
                display_order: i, // Use the index as display order
                is_primary: i === 0
              });
              
            if (imageError) {
              console.error('Error saving image:', imageError);
            }
          }
        }
      }

      // Handle size variants - create for each color
      console.log('Processing size variants...');
      
      if (isEditMode) {
        // For edit mode: Clear existing size variants
        await supabase.from('product_sizes').delete().eq('product_id', productId);
      }

      // Process valid size variants and create for each color
      const validSizeVariants = sizeVariants.filter(v => v.name.trim() && v.priceOriginal > 0);
      const sizeColorVariants = colorVariants.filter(c => c.name.trim() && c.colorCode);
      
      for (const colorVariant of sizeColorVariants) {
        for (const sizeVariant of validSizeVariants) {
          console.log(`Creating size ${sizeVariant.name} for color ${colorVariant.name}`);
          
          const sizeData = {
            product_id: productId,
            color_id: colorVariant.id,
            name: sizeVariant.name.trim(),
            in_stock: sizeVariant.inStock,
            stock_quantity: sizeVariant.inStock ? 100 : 0,
            price_original: sizeVariant.priceOriginal,
            price_discounted: sizeVariant.priceDiscounted || null
          };

          const { error: sizeError } = await supabase
            .from('product_sizes')
            .insert(sizeData);
            
          if (sizeError) {
            console.error('Error creating size variant:', sizeError);
            throw sizeError;
          }
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
      toast({
        title: "Error",
        description: error.message || "There was an error saving the product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a color variant
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

  // Update color variant
  const updateColorVariant = (id: string, field: keyof ColorVariant, value: any) => {
    console.log(`Updating color variant ${id}, field: ${field}`, value);
    setColorVariants(colorVariants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  // Handle image upload
  const handleImageUpload = (colorId: string, imageIndex: number, url: string, filename: string, fileType: string) => {
    console.log(`Uploading image for color ${colorId}, index ${imageIndex}`);
    
    setColorVariants(colorVariants.map(variant => {
      if (variant.id === colorId) {
        const updatedImages = [...variant.images];
        updatedImages[imageIndex] = { url, filename, fileType };
        return { ...variant, images: updatedImages };
      }
      return variant;
    }));
  };

  // Handle image removal
  const handleImageRemove = async (colorId: string, imageIndex: number) => {
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
          updatedImages[imageIndex] = { url: "", filename: "", fileType: "jpg" };
          return { ...v, images: updatedImages };
        }
        return v;
      }));
    }
  };

  // Handle image reordering
  const handleImageReorder = (colorId: string, oldIndex: number, newIndex: number) => {
    console.log(`Reordering images for color ${colorId}: ${oldIndex} -> ${newIndex}`);
    setColorVariants(prevVariants =>
      prevVariants.map(variant => {
        if (variant.id === colorId) {
          const updatedImages = [...variant.images];
          const [movedImage] = updatedImages.splice(oldIndex, 1);
          updatedImages.splice(newIndex, 0, movedImage);
          return { ...variant, images: updatedImages };
        }
        return variant;
      })
    );
  };

  // Legacy remove image function for backward compatibility
  const removeImage = (colorId: string, imageIndex: number) => {
    handleImageRemove(colorId, imageIndex);
  };

  // Size variant functions
  const addSizeVariant = () => {
    const basePrice = parseFloat(originalPrice) || 0;
    const baseDiscounted = discountedPrice ? parseFloat(discountedPrice) : undefined;
    
    setSizeVariants([
      ...sizeVariants,
      { 
        id: generateUUID(), 
        name: "", 
        inStock: true, 
        priceOriginal: basePrice,
        priceDiscounted: baseDiscounted,
        isExisting: false
      }
    ]);
  };

  const removeSizeVariant = (id: string) => {
    setSizeVariants(sizeVariants.filter(variant => variant.id !== id));
  };

  const updateSizeVariant = (id: string, field: keyof SizeVariant, value: any) => {
    setSizeVariants(sizeVariants.map(variant => 
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  // Specification functions
  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { key: "", value: "" }
    ]);
  };

  const removeSpecification = (index: number) => {
    const newSpecifications = [...specifications];
    newSpecifications.splice(index, 1);
    setSpecifications(newSpecifications);
  };

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
                <TabsTrigger value="sizes">Size Variants & Pricing</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description *</Label>
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
                      <Label htmlFor="originalPrice">Base Original Price *</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        required
                      />
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
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mainCategory">Main Category *</Label>
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
                      <Label htmlFor="subCategory">Subcategory *</Label>
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
                  <div className="space-y-2">
                    <Label>Age Ranges</Label>
                    <div className="flex flex-wrap gap-2">
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

                          <div className="border-t pt-4">
                            <ReorderableImageGrid
                              colorVariantId={variant.id}
                              colorVariantName={variant.name || `Color #${index + 1}`}
                              images={variant.images}
                              onImageChange={(imageIndex, url, filename, fileType) =>
                                handleImageUpload(variant.id, imageIndex, url, filename, fileType)
                              }
                              onImageRemove={(imageIndex) =>
                                handleImageRemove(variant.id, imageIndex)
                              }
                              onReorder={(oldIndex, newIndex) =>
                                handleImageReorder(variant.id, oldIndex, newIndex)
                              }
                              maxImages={6}
                            />
                          </div>
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
