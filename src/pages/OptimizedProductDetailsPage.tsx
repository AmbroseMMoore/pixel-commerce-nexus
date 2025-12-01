import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Heart, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { ColorVariant, SizeVariant } from "@/types/product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOptimizedProduct } from "@/hooks/useOptimizedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PincodeChecker from "@/components/products/PincodeChecker";
import { useDeliveryInfo } from "@/hooks/useDeliveryInfo";
import ProductNavigation from "@/components/products/ProductNavigation";

const OptimizedProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error, isError } = useOptimizedProduct(slug || "");
  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { deliveryInfo, handleDeliveryInfoChange } = useDeliveryInfo();

  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set default selections when product loads
  React.useEffect(() => {
    if (product && product.colorVariants.length > 0) {
      const firstColor = product.colorVariants[0];
      setSelectedColor(firstColor);
      const firstAvailableSize = firstColor.sizes.find((s) => s.inStock);
      setSelectedSize(firstAvailableSize || firstColor.sizes[0] || null);
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

  if (isError || !product || !selectedColor) {
    return (
      <MainLayout>
        <div className="container-custom py-16">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Product not found or failed to load. Please try again."}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button asChild>
              <a href="/category/boys">Browse Products</a>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (selectedSize.stockQuantity === 0) {
      toast.error("This size is currently out of stock");
      return;
    }

    if (quantity > selectedSize.stockQuantity) {
      toast.error(`Only ${selectedSize.stockQuantity} items available`);
      return;
    }

    addToCart({
      productId: product.id,
      colorId: selectedColor.id,
      sizeId: selectedSize.id,
      quantity
    });
  };

  const handleAddToWishlist = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToWishlist(product.id, selectedColor.id, selectedSize.id);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (selectedSize && quantity < selectedSize.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // Get current price based on selected size or fallback to base price
  const getCurrentPrice = () => {
    if (selectedSize) {
      return {
        original: selectedSize.priceOriginal || product.price.original,
        discounted: selectedSize.priceDiscounted || product.price.discounted
      };
    }
    return product.price;
  };

  const currentPrice = getCurrentPrice();
  const hasDiscount = currentPrice.discounted !== undefined && currentPrice.discounted < currentPrice.original;

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

            {/* Navigation Dots */}
            {selectedColor.images.length > 1 && (
              <div className="flex justify-center space-x-2 py-2">
                {selectedColor.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      currentImageIndex === index 
                        ? "bg-brand" 
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

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

            {/* Dynamic Price based on selected size */}
            <div className="flex items-center gap-2 mb-4">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-semibold text-red-600">
                    ₹{currentPrice.discounted?.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{currentPrice.original.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-semibold">
                  ₹{currentPrice.original.toFixed(2)}
                </span>
              )}
              {selectedSize && (
                <span className="text-sm text-gray-500 ml-2">
                  for size {selectedSize.name}
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

            {/* Size Selection with Individual Pricing */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Size</h3>
              <RadioGroup
                value={selectedSize?.id || ""}
                onValueChange={(value) => {
                  const size = selectedColor?.sizes.find((s) => s.id === value);
                  setSelectedSize(size || null);
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {selectedColor?.sizes.map((size) => {
                    const sizePrice = size.priceOriginal || product.price.original;
                    const sizeDiscountedPrice = size.priceDiscounted || product.price.discounted;
                    
                    return (
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
                            "flex flex-col items-center justify-center rounded-md border text-sm cursor-pointer p-3 min-w-[80px]",
                            selectedSize?.id === size.id
                              ? "border-brand bg-brand/10 text-brand font-medium"
                              : "border-gray-200",
                            !size.inStock && "bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          <span className="font-medium">{size.name}</span>
                          <span className="text-xs mt-1">
                            {sizeDiscountedPrice && sizeDiscountedPrice < sizePrice ? (
                              <>
                                <span className="text-red-600">₹{sizeDiscountedPrice.toFixed(0)}</span>
                                <span className="line-through ml-1">₹{sizePrice.toFixed(0)}</span>
                              </>
                            ) : (
                              <span>₹{sizePrice.toFixed(0)}</span>
                            )}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
              {selectedColor?.sizes.some((s) => !s.inStock) && (
                <p className="text-sm text-gray-500 mt-2">
                  Some sizes are currently out of stock
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Quantity</h3>
              
              {/* Stock Display */}
              {selectedSize && (
                <div className="mb-3">
                  {selectedSize.stockQuantity > 0 ? (
                    selectedSize.stockQuantity <= 10 ? (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Only {selectedSize.stockQuantity} left in stock!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          In Stock ({selectedSize.stockQuantity} available)
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || !selectedSize || selectedSize.stockQuantity === 0}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={!selectedSize || quantity >= selectedSize.stockQuantity}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {selectedSize && quantity >= selectedSize.stockQuantity && selectedSize.stockQuantity > 0 && (
                <p className="text-sm text-amber-600 mt-2">Maximum quantity reached</p>
              )}
            </div>

            {/* Pincode Checker */}
            <div className="mb-6">
              <PincodeChecker onDeliveryInfoChange={handleDeliveryInfoChange} />
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                className="sm:flex-1 bg-brand hover:bg-brand-dark h-11"
                size="lg"
                disabled={product.isOutOfStock || !selectedSize?.inStock || selectedSize?.stockQuantity === 0 || isAddingToCart}
              >
                {isAddingToCart ? "Adding to Cart..." : selectedSize?.stockQuantity === 0 ? "Out of Stock" : product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

            {/* Delivery Information Display */}
            {deliveryInfo && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Delivery Information</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Delivering to: {deliveryInfo.city}, {deliveryInfo.state}</p>
                  <p>Delivery Time: {deliveryInfo.delivery_days_min === deliveryInfo.delivery_days_max 
                    ? `${deliveryInfo.delivery_days_min} days`
                    : `${deliveryInfo.delivery_days_min}-${deliveryInfo.delivery_days_max} days`
                  }</p>
                  <p>Delivery Charge: ₹{deliveryInfo.delivery_charge}</p>
                  <p className="font-medium">{deliveryInfo.zone_name} - Zone {deliveryInfo.zone_number}</p>
                </div>
              </div>
            )}

            {/* Product Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
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
        {product.longDescription && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <div className="prose max-w-none text-gray-700">
              <p>{product.longDescription}</p>
            </div>
          </div>
        )}

        {/* Product Navigation */}
        <ProductNavigation 
          currentSlug={product.slug}
          categoryId={product.categoryId}
          subCategoryId={product.subCategoryId}
        />
      </div>
    </MainLayout>
  );
};

export default OptimizedProductDetailsPage;
