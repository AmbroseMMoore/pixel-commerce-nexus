
import { Product } from "@/types/product";

export const useProductPricing = (product: Product) => {
  // Calculate price range from size variants, fallback to base product price
  const getPriceRange = () => {
    const availableSizes = product.sizeVariants.filter(size => size.inStock);
    const sizesToCheck = availableSizes.length > 0 ? availableSizes : product.sizeVariants;
    
    // If no size variants, use base product price
    if (sizesToCheck.length === 0) {
      return {
        minOriginal: product.price.original,
        maxOriginal: product.price.original,
        minDiscounted: product.price.discounted,
        maxDiscounted: product.price.discounted
      };
    }
    
    // Get prices from size variants, fallback to base product price if not set
    const originalPrices = sizesToCheck.map(size => {
      const price = size.priceOriginal;
      return (price && !isNaN(price) && price > 0) ? price : product.price.original;
    });
    
    const discountedPrices = sizesToCheck
      .map(size => {
        const price = size.priceDiscounted;
        return (price && !isNaN(price) && price > 0) ? price : product.price.discounted;
      })
      .filter(price => price !== undefined && price !== null && price > 0) as number[];
    
    return {
      minOriginal: Math.min(...originalPrices),
      maxOriginal: Math.max(...originalPrices),
      minDiscounted: discountedPrices.length > 0 ? Math.min(...discountedPrices) : undefined,
      maxDiscounted: discountedPrices.length > 0 ? Math.max(...discountedPrices) : undefined
    };
  };

  const priceRange = getPriceRange();
  const hasVariedPricing = priceRange.minOriginal !== priceRange.maxOriginal;
  const hasDiscount = priceRange.minDiscounted !== undefined && priceRange.minDiscounted !== null && priceRange.minDiscounted > 0;

  const formatPriceDisplay = () => {
    // For landing page cards, always show the lowest available price
    const lowestPrice = hasDiscount ? priceRange.minDiscounted : priceRange.minOriginal;
    const highestOriginalPrice = priceRange.maxOriginal;

    if (hasDiscount) {
      if (hasVariedPricing) {
        return {
          current: `From ₹${priceRange.minDiscounted?.toFixed(0)}`,
          original: `₹${priceRange.minOriginal.toFixed(0)} - ₹${priceRange.maxOriginal.toFixed(0)}`
        };
      } else {
        return {
          current: `₹${priceRange.minDiscounted?.toFixed(0)}`,
          original: `₹${priceRange.minOriginal.toFixed(0)}`
        };
      }
    } else {
      return {
        current: hasVariedPricing 
          ? `From ₹${priceRange.minOriginal.toFixed(0)}`
          : `₹${priceRange.minOriginal.toFixed(0)}`,
        original: null
      };
    }
  };

  return {
    priceRange,
    hasVariedPricing,
    hasDiscount,
    formatPriceDisplay,
    lowestPrice: hasDiscount ? priceRange.minDiscounted : priceRange.minOriginal
  };
};
