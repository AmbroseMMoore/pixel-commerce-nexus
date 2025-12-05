
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OptimizedProductCardProps {
  product: Product;
  loading?: boolean;
}

const OptimizedProductCard = ({ product, loading = false }: OptimizedProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.colorVariants[0]?.images[0] || "/placeholder.svg";
  
  // Calculate price range from all sizes across all colors
  const getPriceRange = () => {
    const allSizes = product.colorVariants.flatMap(c => c.sizes);
    const availableSizes = allSizes.filter(size => size.inStock);
    const sizesToCheck = availableSizes.length > 0 ? availableSizes : allSizes;
    
    if (sizesToCheck.length === 0) {
      return {
        minOriginal: product.price.original,
        maxOriginal: product.price.original,
        minDiscounted: product.price.discounted,
        maxDiscounted: product.price.discounted
      };
    }
    
    const originalPrices = sizesToCheck.map(size => size.priceOriginal);
    const discountedPrices = sizesToCheck
      .map(size => size.priceDiscounted)
      .filter(price => price !== undefined) as number[];
    
    return {
      minOriginal: Math.min(...originalPrices),
      maxOriginal: Math.max(...originalPrices),
      minDiscounted: discountedPrices.length > 0 ? Math.min(...discountedPrices) : undefined,
      maxDiscounted: discountedPrices.length > 0 ? Math.max(...discountedPrices) : undefined
    };
  };

  const priceRange = getPriceRange();
  const hasVariedPricing = priceRange.minOriginal !== priceRange.maxOriginal;
  const hasDiscount = priceRange.minDiscounted !== undefined;

  if (loading) {
    return <OptimizedProductCardSkeleton />;
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <img
          src={imageError ? "/placeholder.svg" : primaryImage}
          alt={product.title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              New Launch
            </span>
          )}
          {product.isTrending && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
              Trending
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist logic here
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Stock Status Overlay */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-black px-3 py-1 rounded text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          {hasDiscount ? (
            <>
              {hasVariedPricing ? (
                <>
                  <span className="text-lg font-semibold text-red-600">
                    ₹{priceRange.minDiscounted?.toFixed(2)} - ₹{priceRange.maxDiscounted?.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{priceRange.minOriginal.toFixed(2)} - ₹{priceRange.maxOriginal.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-semibold text-red-600">
                    ₹{priceRange.minDiscounted?.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{priceRange.minOriginal.toFixed(2)}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {hasVariedPricing ? (
                `₹${priceRange.minOriginal.toFixed(2)} - ₹${priceRange.maxOriginal.toFixed(2)}`
              ) : (
                `₹${priceRange.minOriginal.toFixed(2)}`
              )}
            </span>
          )}
        </div>

        {/* Color Options Preview */}
        {product.colorVariants.length > 1 && (
          <div className="flex gap-1 mt-2">
            {product.colorVariants.slice(0, 4).map((color) => (
              <div
                key={color.id}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.colorCode }}
                title={color.name}
              />
            ))}
            {product.colorVariants.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">
                +{product.colorVariants.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton component for loading state
export const OptimizedProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded-t-lg" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
        <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2" />
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedProductCard;
