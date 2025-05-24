
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Heart } from "lucide-react";
import { ColorVariant, SizeVariant } from "@/types/product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProduct } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");

  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set default selections when product loads
  React.useEffect(() => {
    if (product && product.colorVariants.length > 0) {
      setSelectedColor(product.colorVariants[0]);
      const firstAvailableSize = product.sizeVariants.find((s) => s.inStock);
      setSelectedSize(firstAvailableSize || product.sizeVariants[0] || null);
    }
  }, [product]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="grid grid-cols-6 gap-2">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product || !selectedColor) {
    return (
      <MainLayout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-4">
            <a href="/category/boys">Browse Products</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    toast.success(`Added ${quantity} ${product.title} to cart`);
  };

  const handleAddToWishlist = () => {
    toast.success(`Added ${product.title} to wishlist`);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const hasDiscount =
    product.price.discounted !== undefined &&
    product.price.discounted < product.price.original;

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={selectedColor.images[currentImageIndex] || "/placeholder.svg"}
                alt={`${product.title} - ${selectedColor.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-6 gap-2">
              {selectedColor.images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "aspect-square rounded-md overflow-hidden border-2",
                    currentImageIndex === index
                      ? "border-brand"
                      : "border-transparent"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>

            {/* Price */}
            <div className="flex items-center gap-2 mb-4">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-semibold text-red-600">
                    ₹{product.price.discounted?.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.price.original.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold">
                  ₹{product.price.original.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.shortDescription}</p>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Color: {selectedColor.name}</h3>
              <div className="flex flex-wrap gap-2">
                {product.colorVariants.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color);
                      setCurrentImageIndex(0);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full border-2",
                      selectedColor.id === color.id
                        ? "border-brand"
                        : "border-transparent"
                    )}
                    title={color.name}
                  >
                    <span
                      className="block w-full h-full rounded-full"
                      style={{ backgroundColor: color.colorCode }}
                    ></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Size</h3>
              <RadioGroup
                value={selectedSize?.id || ""}
                onValueChange={(value) => {
                  const size = product.sizeVariants.find((s) => s.id === value);
                  setSelectedSize(size || null);
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {product.sizeVariants.map((size) => (
                    <div key={size.id} className="flex items-center">
                      <RadioGroupItem
                        value={size.id}
                        id={`size-${size.id}`}
                        disabled={!size.inStock}
                        className="hidden"
                      />
                      <Label
                        htmlFor={`size-${size.id}`}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border text-sm cursor-pointer",
                          selectedSize?.id === size.id
                            ? "border-brand bg-brand/10 text-brand font-medium"
                            : "border-gray-200",
                          !size.inStock && "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        {size.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {product.sizeVariants.some((s) => !s.inStock) && (
                <p className="text-sm text-gray-500 mt-2">
                  Some sizes are currently out of stock
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Quantity</h3>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-brand hover:bg-brand-dark"
                size="lg"
                disabled={product.isOutOfStock || !selectedSize?.inStock}
              >
                {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Heart size={18} />
                <span>Add to Wishlist</span>
              </Button>
            </div>

            {/* Product Specifications */}
            {product.specifications && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="font-medium text-gray-900 w-24">{key}:</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none text-gray-700">
            <p>{product.longDescription}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;
