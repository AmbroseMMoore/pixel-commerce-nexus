import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { createProduct, updateProduct } from "@/services/adminApi";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import { fetchProduct } from "@/services/api";
import { Product } from "@/types/product";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  slug: z.string().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((value) => {
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
  subCategoryId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional(),
  specifications: z.array(z.string()).optional(),
  colorVariants: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    colorCode: z.string().optional(),
    productId: z.string().optional(),
    isNew: z.boolean().optional()
  })).optional(),
  sizeVariants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().optional(),
    stock: z.string().optional(),
    productId: z.string().optional(),
    isNew: z.boolean().optional()
  })).optional(),
});

const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories } = useCategories();
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: "",
    subCategoryId: "",
    isFeatured: false,
    isTrending: false,
    isActive: true,
    images: [],
    specifications: [],
    colorVariants: [],
    sizeVariants: []
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: existingProduct, isLoading } = useQuery(
    ["product", id],
    () => id ? fetchProduct(id) : null,
    {
      enabled: !!id,
      onSuccess: (data) => {
        if (data) {
          setProduct(data);
        }
      },
      onError: (error: any) => {
        toast({
          title: "Error fetching product",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: existingProduct ? zodResolver(formSchema) : zodResolver(formSchema),
    defaultValues: {
      name: existingProduct?.name || "",
      slug: existingProduct?.slug || "",
      description: existingProduct?.description || "",
      price: existingProduct?.price || "",
      categoryId: existingProduct?.categoryId || "",
      subCategoryId: existingProduct?.subCategoryId || "",
      isFeatured: existingProduct?.isFeatured || false,
      isTrending: existingProduct?.isTrending || false,
      isActive: existingProduct?.isActive || true,
      images: existingProduct?.images || [],
      specifications: existingProduct?.specifications || [],
      colorVariants: existingProduct?.colorVariants || [],
      sizeVariants: existingProduct?.sizeVariants || []
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (existingProduct) {
      form.reset(existingProduct);
    }
  }, [existingProduct, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const productData = {
        ...values,
        slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
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

  const handleRemoveColor = (index: number) => {
    const updatedColorVariants = [...product.colorVariants!];
    updatedColorVariants.splice(index, 1);
    setProduct({...product, colorVariants: updatedColorVariants});
  };

  const handleColorChange = (index: number, field: string, value: string) => {
    const updatedColorVariants = [...product.colorVariants!];
    updatedColorVariants[index] = {
      ...updatedColorVariants[index],
      [field]: value
    };
    setProduct({...product, colorVariants: updatedColorVariants});
  };

  const handleAddColor = () => {
    const newColor = {
      id: '',
      name: '',
      colorCode: '',
      productId: '',
      isNew: true
    };
    setProduct({
      ...product, 
      colorVariants: [...product.colorVariants!, newColor]
    });
  };

  const handleRemoveSize = (index: number) => {
    const updatedSizeVariants = [...product.sizeVariants!];
    updatedSizeVariants.splice(index, 1);
    setProduct({...product, sizeVariants: updatedSizeVariants});
  };

  const handleSizeChange = (index: number, field: string, value: any) => {
    const updatedSizeVariants = [...product.sizeVariants!];
    updatedSizeVariants[index] = {
      ...updatedSizeVariants[index],
      [field]: value
    };
    setProduct({...product, sizeVariants: updatedSizeVariants});
  };

  const handleRemoveSpecification = (index: number) => {
    const updatedSpecifications = [...product.specifications!];
    updatedSpecifications.splice(index, 1);
    setProduct({...product, specifications: updatedSpecifications});
  };

  const handleSpecificationChange = (index: number, value: string) => {
    const updatedSpecifications = [...product.specifications!];
    updatedSpecifications[index] = value;
    setProduct({...product, specifications: updatedSpecifications});
  };

  const handleAddSpecification = () => {
    setProduct({
      ...product, 
      specifications: [...product.specifications!, '']
    });
  };

  if (isLoading) {
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Name" {...field} />
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
                  name="description"
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
                    name="price"
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
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            Should this product be featured?
                          </FormDescription>
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
                          <FormDescription>
                            Should this product be trending?
                          </FormDescription>
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
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Is this product active?
                          </FormDescription>
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
                  {product.specifications && product.specifications.map((spec, index) => (
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
                  {product.colorVariants && product.colorVariants.map((color, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <Input
                        type="text"
                        placeholder="Color Name"
                        value={color.name || ''}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                      />
                      <Input
                        type="color"
                        value={color.colorCode || ''}
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
                  {product.sizeVariants && product.sizeVariants.map((size, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <Input
                        type="text"
                        placeholder="Size"
                        value={size.size || ''}
                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={size.stock || ''}
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
                  <Button type="button" variant="outline" size="sm" onClick={() => setProduct({
                    ...product, 
                    sizeVariants: [...product.sizeVariants!, { size: '', stock: '', productId: '', id: '', isNew: true }]
                  })}>
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
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminProductForm;
