import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import { useCategories } from "@/hooks/useCategories";
import OrderedImageUpload from "@/components/admin/OrderedImageUpload";
import { supabase } from "@/integrations/supabase/client";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  priceOriginal: z.number().min(0, "Price must be positive"),
  priceDiscounted: z.number().min(0, "Price must be positive").optional(),
  stockQuantity: z.number().min(0, "Stock quantity must be non-negative"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  specifications: z.record(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ColorVariant {
  id?: string;
  name: string;
  colorCode: string;
  images: Array<{ url: string; file?: File; displayOrder: number }>;
}

interface SizeVariant {
  id?: string;
  name: string;
  priceOriginal: number;
  priceDiscounted?: number;
  inStock: boolean;
}

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [specificationKey, setSpecificationKey] = useState("");
  const [specificationValue, setSpecificationValue] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      longDescription: "",
      priceOriginal: 0,
      priceDiscounted: 0,
      stockQuantity: 0,
      categoryId: "",
      subcategoryId: "",
      isFeatured: false,
      isTrending: false,
      specifications: {},
    },
  });

  const selectedCategoryId = form.watch("categoryId");

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubcategories([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategoryId);

        if (error) throw error;
        setSubcategories(data || []);
      } catch (error) {
        console.error("Error loading subcategories:", error);
        toast.error("Failed to load subcategories");
      }
    };

    loadSubcategories();
  }, [selectedCategoryId]);

  // Load existing product data if editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditing || !id) return;

      try {
        setIsLoading(true);
        
        // Load product data
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (productError) throw productError;

        // Populate form with product data
        form.reset({
          title: product.title,
          slug: product.slug,
          shortDescription: product.short_description || "",
          longDescription: product.long_description || "",
          priceOriginal: product.price_original,
          priceDiscounted: product.price_discounted || 0,
          stockQuantity: product.stock_quantity,
          categoryId: product.category_id,
          subcategoryId: product.subcategory_id,
          isFeatured: product.is_featured || false,
          isTrending: product.is_trending || false,
          specifications: product.specifications || {},
        });

        // Set specifications
        setSpecifications(product.specifications || {});

        // Set age ranges
        setAgeRanges(product.age_ranges || []);

        // Load subcategories first, then set the subcategory value
        if (product.category_id) {
          const { data: subcats, error: subcatError } = await supabase
            .from("subcategories")
            .select("*")
            .eq("category_id", product.category_id);

          if (subcatError) throw subcatError;
          setSubcategories(subcats || []);
          
          // Set subcategory after subcategories are loaded
          setTimeout(() => {
            form.setValue("subcategoryId", product.subcategory_id);
          }, 100);
        }

        // Load color variants and images
        const { data: colors, error: colorsError } = await supabase
          .from("product_colors")
          .select("*")
          .eq("product_id", id);

        if (colorsError) throw colorsError;

        const colorVariantsData: ColorVariant[] = [];
        for (const color of colors || []) {
          const { data: images, error: imagesError } = await supabase
            .from("product_images")
            .select("*")
            .eq("color_id", color.id)
            .order("display_order", { ascending: true });

          if (imagesError) throw imagesError;

          colorVariantsData.push({
            id: color.id,
            name: color.name,
            colorCode: color.color_code,
            images: (images || []).map((img, index) => ({
              url: img.image_url,
              displayOrder: img.display_order ?? index
            })),
          });
        }
        setColorVariants(colorVariantsData);

        // Load size variants
        const { data: sizes, error: sizesError } = await supabase
          .from("product_sizes")
          .select("*")
          .eq("product_id", id);

        if (sizesError) throw sizesError;

        const sizeVariantsData: SizeVariant[] = (sizes || []).map((size) => ({
          id: size.id,
          name: size.name,
          priceOriginal: size.price_original,
          priceDiscounted: size.price_discounted || undefined,
          inStock: size.in_stock ?? true,
        }));
        setSizeVariants(sizeVariantsData);
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditing, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!isEditing) {
      form.setValue("slug", generateSlug(title));
    }
  };

  const addColorVariant = () => {
    setColorVariants([
      ...colorVariants,
      { name: "", colorCode: "#000000", images: [] },
    ]);
  };

  const removeColorVariant = (index: number) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  const updateColorVariant = (index: number, field: string, value: any) => {
    const updated = [...colorVariants];
    updated[index] = { ...updated[index], [field]: value };
    setColorVariants(updated);
  };

  const addSizeVariant = () => {
    setSizeVariants([
      ...sizeVariants,
      { name: "", priceOriginal: 0, priceDiscounted: 0, inStock: true },
    ]);
  };

  const removeSizeVariant = (index: number) => {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  const updateSizeVariant = (index: number, field: string, value: any) => {
    const updated = [...sizeVariants];
    updated[index] = { ...updated[index], [field]: value };
    setSizeVariants(updated);
  };

  const addAgeRange = (range: string) => {
    if (range && !ageRanges.includes(range)) {
      setAgeRanges([...ageRanges, range]);
    }
  };

  const removeAgeRange = (range: string) => {
    setAgeRanges(ageRanges.filter((r) => r !== range));
  };

  const addSpecification = () => {
    if (specificationKey && specificationValue) {
      setSpecifications({
        ...specifications,
        [specificationKey]: specificationValue,
      });
      setSpecificationKey("");
      setSpecificationValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const updated = { ...specifications };
    delete updated[key];
    setSpecifications(updated);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      // Validate required data
      if (colorVariants.length === 0) {
        toast.error("At least one color variant is required");
        return;
      }

      if (sizeVariants.length === 0) {
        toast.error("At least one size variant is required");
        return;
      }

      // Prepare product data
      const productData = {
        title: data.title,
        slug: data.slug,
        short_description: data.shortDescription,
        long_description: data.longDescription,
        price_original: data.priceOriginal,
        price_discounted: data.priceDiscounted || null,
        stock_quantity: data.stockQuantity,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId,
        is_featured: data.isFeatured,
        is_trending: data.isTrending,
        specifications: specifications,
        age_ranges: ageRanges,
        is_out_of_stock: data.stockQuantity === 0,
        is_low_stock: data.stockQuantity <= 10,
      };

      let productId: string;

      if (isEditing && id) {
        // Update existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);

        if (updateError) throw updateError;
        productId = id;

        // Delete existing colors, sizes, and images
        await supabase.from("product_images").delete().eq("product_id", id);
        await supabase.from("product_colors").delete().eq("product_id", id);
        await supabase.from("product_sizes").delete().eq("product_id", id);
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      // Insert color variants and images
      for (const color of colorVariants) {
        const { data: colorData, error: colorError } = await supabase
          .from("product_colors")
          .insert({
            product_id: productId,
            name: color.name,
            color_code: color.colorCode,
          })
          .select()
          .single();

        if (colorError) throw colorError;

        // Insert images for this color with display_order
        for (let i = 0; i < color.images.length; i++) {
          const image = color.images[i];
          await supabase.from("product_images").insert({
            product_id: productId,
            color_id: colorData.id,
            image_url: image.url,
            display_order: i, // Use index as display order
            is_primary: i === 0,
          });
        }
      }

      // Insert size variants
      for (const size of sizeVariants) {
        await supabase.from("product_sizes").insert({
          product_id: productId,
          name: size.name,
          price_original: size.priceOriginal,
          price_discounted: size.priceDiscounted || null,
          in_stock: size.inStock,
        });
      }

      toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  if (categoriesLoading || (isEditing && isLoading)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            Back to Products
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    onChange={onTitleChange}
                    placeholder="Enter product title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Product Slug</Label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="product-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => {
                      form.setValue("categoryId", value);
                      form.setValue("subcategoryId", ""); // Reset subcategory when category changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={form.watch("subcategoryId")}
                    onValueChange={(value) => form.setValue("subcategoryId", value)}
                    disabled={!selectedCategoryId || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.subcategoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.subcategoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  {...form.register("shortDescription")}
                  placeholder="Brief product description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="longDescription">Long Description</Label>
                <Textarea
                  id="longDescription"
                  {...form.register("longDescription")}
                  placeholder="Detailed product description"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priceOriginal">Original Price (₹)</Label>
                  <Input
                    id="priceOriginal"
                    type="number"
                    step="0.01"
                    {...form.register("priceOriginal", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.priceOriginal && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.priceOriginal.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priceDiscounted">Discounted Price (₹)</Label>
                  <Input
                    id="priceDiscounted"
                    type="number"
                    step="0.01"
                    {...form.register("priceDiscounted", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    {...form.register("stockQuantity", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.stockQuantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.stockQuantity.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {colorVariants.map((color, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Color Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeColorVariant(index)}
                      disabled={colorVariants.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Color Name</Label>
                      <Input
                        value={color.name}
                        onChange={(e) =>
                          updateColorVariant(index, "name", e.target.value)
                        }
                        placeholder="e.g., Red, Blue, Green"
                      />
                    </div>

                    <div>
                      <Label>Color Code</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color.colorCode}
                          onChange={(e) =>
                            updateColorVariant(index, "colorCode", e.target.value)
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={color.colorCode}
                          onChange={(e) =>
                            updateColorVariant(index, "colorCode", e.target.value)
                          }
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Images</Label>
                    <OrderedImageUpload
                      images={color.images}
                      onImagesChange={(images) =>
                        updateColorVariant(index, "images", images)
                      }
                    />
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addColorVariant} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Color Variant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Size Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sizeVariants.map((size, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Size Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSizeVariant(index)}
                      disabled={sizeVariants.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Size Name</Label>
                      <Input
                        value={size.name}
                        onChange={(e) =>
                          updateSizeVariant(index, "name", e.target.value)
                        }
                        placeholder="e.g., S, M, L, XL"
                      />
                    </div>

                    <div>
                      <Label>Original Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={size.priceOriginal}
                        onChange={(e) =>
                          updateSizeVariant(index, "priceOriginal", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Discounted Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={size.priceDiscounted || ""}
                        onChange={(e) =>
                          updateSizeVariant(index, "priceDiscounted", parseFloat(e.target.value) || undefined)
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id={`inStock-${index}`}
                        checked={size.inStock}
                        onCheckedChange={(checked) =>
                          updateSizeVariant(index, "inStock", checked)
                        }
                      />
                      <Label htmlFor={`inStock-${index}`}>In Stock</Label>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addSizeVariant} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Size Variant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Age Ranges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ageRanges.map((range) => (
                  <Badge key={range} variant="secondary" className="flex items-center gap-1">
                    {range}
                    <button
                      type="button"
                      onClick={() => removeAgeRange(range)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["0-1 years", "1-2 years", "2-3 years", "3-5 years", "5-8 years", "8-12 years", "12+ years"].map((range) => (
                  <Button
                    key={range}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAgeRange(range)}
                    disabled={ageRanges.includes(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span><strong>{key}:</strong> {value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecification(key)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Specification key"
                  value={specificationKey}
                  onChange={(e) => setSpecificationKey(e.target.value)}
                />
                <Input
                  placeholder="Specification value"
                  value={specificationValue}
                  onChange={(e) => setSpecificationValue(e.target.value)}
                />
                <Button type="button" onClick={addSpecification}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(checked) => form.setValue("isFeatured", !!checked)}
                />
                <Label htmlFor="isFeatured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTrending"
                  checked={form.watch("isTrending")}
                  onCheckedChange={(checked) => form.setValue("isTrending", !!checked)}
                />
                <Label htmlFor="isTrending">Trending Product</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
