
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

interface ProductCardProps {
  product: Product;
  className?: string;
}

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton = ({ className }: ProductCardSkeletonProps) => {
  return (
    <div className={cn("group", className)}>
      <Skeleton className="aspect-[3/4] w-full rounded-md mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
};

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { logInfo, logError, logFormSuccess } = useLogging();
  
  // Use first color variant's first image as the product thumbnail
  const thumbnailImage = product.colorVariants[0]?.images[0] || "";
  
  // Check if there is a discount
  const hasDiscount = product.price.discounted !== undefined && 
                      product.price.discounted < product.price.original;
  
  // Handle adding to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      logInfo('add_to_cart_attempt', { 
        productId: product.id, 
        productTitle: product.title,
        source: 'product_card'
      });

      // Simulate adding to cart (in a real app, this would call a cart service)
      setTimeout(() => {
        toast({
          title: "Added to Cart",
          description: `${product.title} has been added to your cart.`,
        });
        
        logFormSuccess('cart', 'add_to_cart_success', {
          productId: product.id,
          productTitle: product.title,
          price: product.price
        });
        
        setIsAddingToCart(false);
      }, 600);
    } catch (error) {
      logError('add_to_cart_error', { 
        productId: product.id, 
        error: error instanceof Error ? error.message : error 
      });
      setIsAddingToCart(false);
    }
  };
  
  // Handle adding to wishlist
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      logInfo('add_to_wishlist_attempt', { 
        productId: product.id, 
        productTitle: product.title 
      });

      toast({
        title: "Added to Wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });

      logFormSuccess('wishlist', 'add_to_wishlist_success', {
        productId: product.id,
        productTitle: product.title
      });
    } catch (error) {
      logError('add_to_wishlist_error', { 
        productId: product.id, 
        error: error instanceof Error ? error.message : error 
      });
    }
  };

  // Log product view when card is clicked
  const handleProductClick = () => {
    logInfo('product_card_clicked', {
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug
    });
  };
  
  return (
    <div className={cn("group", className)}>
      <div className="aspect-[3/4] overflow-hidden relative rounded-md mb-3">
        <Link to={`/product/${product.slug}`} onClick={handleProductClick}>
          <img 
            src={thumbnailImage || "/placeholder.svg"} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
              logError('product_image_load_error', {
                productId: product.id,
                imageUrl: thumbnailImage
              });
            }}
          />
        </Link>
        
        {/* Product badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Sale
            </span>
          )}
          {product.isLowStock && !product.isOutOfStock && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Low Stock
            </span>
          )}
          {product.isOutOfStock && (
            <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>
        
        {/* Quick action buttons */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-white text-gray-700 hover:text-brand shadow-sm"
            aria-label="Add to wishlist"
            onClick={handleAddToWishlist}
          >
            <Heart size={18} />
          </Button>
          
          {!product.isOutOfStock && (
            <Button 
              variant="secondary"
              size="icon" 
              className="bg-white text-gray-700 hover:text-brand shadow-sm"
              aria-label="Add to cart"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart size={18} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Product info */}
      <div>
        <Link 
          to={`/product/${product.slug}`}
          onClick={handleProductClick}
          className="text-sm font-medium text-gray-700 hover:text-brand transition-colors mb-1 line-clamp-2"
        >
          {product.title}
        </Link>
        
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-red-600">
                ₹{product.price.discounted?.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{product.price.original.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              ₹{product.price.original.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
