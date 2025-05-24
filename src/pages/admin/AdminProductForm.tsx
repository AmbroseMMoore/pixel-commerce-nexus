
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { createProduct, updateProduct } from "@/services/adminApi";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Product title must be at least 2 characters.",
  }),
  slug: z.string().optional(),
  shortDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  priceOriginal: z.string().refine((value) => {
    try {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    } catch (e) {
      return false;
    }
  }, {
    message: "Price must be a valid number and greater than 0.",
  }),
  categoryId: z.string().min(1, {
    message: "You need to select a category.",
  }),
  subcategoryId: z.string().min(1, {
    message: "You need to select a subcategory.",
  }),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  stockQuantity: z.string().refine((value) => {
    try {
      const num = parseInt(value);
      return !isNaN(num) && num >= 0;
    } catch (e) {
      return false;
    }
  }, {
    message: "Stock quantity must be a valid number.",
  }),
});

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Product variant states
  const [specifications, setSpecifications] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<Array<{name: string, colorCode: string}>>([]);
  const [sizeVariants, setSizeVariants] = useState<Array<{size: string, stock: number}>>([]);

  // Only fetch product if we're editing (id exists)
  const { data: existingProduct, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductBySlug(id!),
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      priceOriginal: "",
      categoryId: "",
      subcategoryId: "",
      isFeatured: false,
      isTrending: false,
      stockQuantity: "0",
    },
    mode: "onChange",
  });

  // Handle form initialization for editing
  useEffect(() => {
    if (id && existingProduct) {
      setSelectedCategoryId(existingProduct.categoryId);
      
      // Set specifications and variants if they exist
      if (existingProduct.specifications) {
        if (Array.isArray(existingProduct.specifications)) {
          setSpecifications(existingProduct.specifications);
        } else if (typeof existingProduct.specifications === 'object') {
          setSpecifications(Object.values(existingProduct.specifications));
        }
      }

      // Set color and size variants if they exist
      if (existingProduct.colorVariants) {
        setColorVariants(existingProduct.colorVariants.map(variant => ({
          name: variant.name,
          colorCode: variant.colorCode
        })));
      }

      if (existingProduct.sizeVariants) {
        setSizeVariants(existingProduct.sizeVariants.map(variant => ({
          size: variant.name,
          stock: variant.inStock ? 10 : 0 // Default stock if in stock
        })));
      }
      
      form.reset({
        title: existingProduct.title,
        slug: existingProduct.slug,
        shortDescription: existingProduct.shortDescription || existingProduct.longDescription || "",
        priceOriginal: existingProduct.price.original.toString(),
        categoryId: existingProduct.categoryId,
        subcategoryId: existingProduct.subCategoryId,
        isFeatured: existingProduct.isFeatured || false,
        isTrending: existingProduct.isTrending || false,
        stockQuantity: "0",
      });
    }
  }, [id, existingProduct, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const productData = {
        title: values.title,
        slug: values.slug || values.title.toLowerCase().replace(/\s+/g, '-'),
        short_description: values.shortDescription,
        price_original: parseFloat(values.priceOriginal),
        category_id: values.categoryId,
        subcategory_id: values.subcategoryId,
        is_featured: values.isFeatured,
        is_trending: values.isTrending,
        stock_quantity: parseInt(values.stockQuantity),
        specifications: specifications.length > 0 ? specifications : {},
      };

      if (id) {
        // Update existing product
        await updateProduct(id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
      } else {
        // Create new product
        await createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully.",
        });
      }
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setFormError(error.message || "An error occurred. Please try again.");
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Specification handlers
  const handleAddSpecification = () => {
    setSpecifications([...specifications, '']);
  };

  const handleRemoveSpecification = (index: number) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications.splice(index, 1);
    setSpecifications(updatedSpecifications);
  };

  const handleSpecificationChange = (index: number, value: string) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications[index] = value;
    setSpecifications(updatedSpecifications);
  };

  // Color variant handlers
  const handleAddColor = () => {
    setColorVariants([...colorVariants, { name: '', colorCode: '#000000' }]);
  };

  const handleRemoveColor = (index: number) => {
    const updatedColorVariants = [...colorVariants];
    updatedColorVariants.splice(index, 1);
    setColorVariants(updatedColorVariants);
  };

  const handleColorChange = (index: number, field: string, value: string) => {
    const updatedColorVariants = [...colorVariants];
    updatedColorVariants[index] = {
      ...updatedColorVariants[index],
      [field]: value
    };
    setColorVariants(updatedColorVariants);
  };

  // Size variant handlers
  const handleAddSize = () => {
    setSizeVariants([...sizeVariants, { size: '', stock: 0 }]);
  };

  const handleRemoveSize = (index: number) => {
    const updatedSizeVariants = [...sizeVariants];
    updatedSizeVariants.splice(index, 1);
    setSizeVariants(updatedSizeVariants);
  };

  const handleSizeChange = (index: number, field: string, value: any) => {
    const updatedSizeVariants = [...sizeVariants];
    updatedSizeVariants[index] = {
      ...updatedSizeVariants[index],
      [field]: field === 'stock' ? parseInt(value) || 0 : value
    };
    setSizeVariants(updatedSizeVariants);
  };

  // Get subcategories for selected category
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const subcategories = selectedCategory?.subCategories || [];

  if (categoriesLoading || (id && productLoading)) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  if (id && productError) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="container mx-auto py-10">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load product. Please try again or go back to the products list.
              </AlertDescription>
            </Alert>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>{id ? "Edit Product" : "Create New Product"}</CardTitle>
              <CardDescription>
                {id ? "Edit the product details." : "Enter the product details."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Product Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Product Slug" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Product Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceOriginal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="Product Price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="Stock Quantity" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCategoryId(value);
                              form.setValue("subcategoryId", ""); // Reset subcategory when category changes
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subcategories.map((subcategory) => (
                                <SelectItem key={subcategory.id} value={subcategory.id}>
                                  {subcategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Featured</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Should this product be featured?
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isTrending"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Trending</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Should this product be trending?
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <Label>Specifications</Label>
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder={`Specification ${index + 1}`}
                          value={spec}
                          onChange={(e) => handleSpecificationChange(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpecification(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSpecification}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Specification
                    </Button>
                  </div>

                  {/* Color Variants */}
                  <div className="space-y-2">
                    <Label>Color Variants</Label>
                    {colorVariants.map((color, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center">
                        <Input
                          type="text"
                          placeholder="Color Name"
                          value={color.name}
                          onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        />
                        <Input
                          type="color"
                          value={color.colorCode}
                          onChange={(e) => handleColorChange(index, 'colorCode', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveColor(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Color Variant
                    </Button>
                  </div>

                  {/* Size Variants */}
                  <div className="space-y-2">
                    <Label>Size Variants</Label>
                    {sizeVariants.map((size, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center">
                        <Input
                          type="text"
                          placeholder="Size"
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={size.stock}
                          onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSize(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSize}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Size Variant
                    </Button>
                  </div>

                  <CardFooter className="pt-6">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminProductForm;
