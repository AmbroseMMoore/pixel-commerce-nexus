
import { Product } from "@/types/product";

export const useProductPricing = (product: Product) => {
  // Calculate price range from size variants, fallback to base product price
  const getPriceRange = () => {
    const availableSizes = product.sizeVariants.filter(size => size.inStock);
    const sizesToCheck = availableSizes.length > 0 ? availableSizes : product.sizeVariants;
    
    if (sizesToCheck.length === 0) {
      return {
        minOriginal: product.price.original,
        maxOriginal: product.price.original,
        minDiscounted: product.price.discounted,
        maxDiscounted: product.price.discounted
      };
    }
    
    // Get prices from size variants, fallback to base product price if NaN or undefined
    const originalPrices = sizesToCheck.map(size => {
      const price = size.priceOriginal;
      return (price && !isNaN(price)) ? price : product.price.original;
    });
    
    const discountedPrices = sizesToCheck
      .map(size => {
        const price = size.priceDiscounted;
        return (price && !isNaN(price)) ? price : product.price.discounted;
      })
      .filter(price => price !== undefined && price !== null) as number[];
    
    return {
      minOriginal: Math.min(...originalPrices),
      maxOriginal: Math.max(...originalPrices),
      minDiscounted: discountedPrices.length > 0 ? Math.min(...discountedPrices) : undefined,
      maxDiscounted: discountedPrices.length > 0 ? Math.max(...discountedPrices) : undefined
    };
  };

  const priceRange = getPriceRange();
  const hasVariedPricing = priceRange.minOriginal !== priceRange.maxOriginal;
  const hasDiscount = priceRange.minDiscounted !== undefined && priceRange.minDiscounted !== null;

  const formatPriceDisplay = () => {
    if (hasDiscount) {
      if (hasVariedPricing) {
        return {
          current: `₹${priceRange.minDiscounted?.toFixed(2)} - ₹${priceRange.maxDiscounted?.toFixed(2)}`,
          original: `₹${priceRange.minOriginal.toFixed(2)} - ₹${priceRange.maxOriginal.toFixed(2)}`
        };
      } else {
        return {
          current: `₹${priceRange.minDiscounted?.toFixed(2)}`,
          original: `₹${priceRange.minOriginal.toFixed(2)}`
        };
      }
    } else {
      return {
        current: hasVariedPricing 
          ? `₹${priceRange.minOriginal.toFixed(2)} - ₹${priceRange.maxOriginal.toFixed(2)}`
          : `₹${priceRange.minOriginal.toFixed(2)}`,
        original: null
      };
    }
  };

  return {
    priceRange,
    hasVariedPricing,
    hasDiscount,
    formatPriceDisplay
  };
};
