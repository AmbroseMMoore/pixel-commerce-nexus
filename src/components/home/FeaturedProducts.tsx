
import React from "react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  isLoading?: boolean;
}

const FeaturedProducts = ({ 
  products, 
  title = "Featured Products",
  isLoading = false
}: FeaturedProductsProps) => {
  // Create an array of 8 items for the skeleton loader
  const skeletonArray = Array(8).fill(0);
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Skeleton loader
            skeletonArray.map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                <Skeleton className="aspect-square w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))
          ) : (
            // Actual products
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
