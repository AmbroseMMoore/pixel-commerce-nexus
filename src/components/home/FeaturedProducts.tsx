
import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
        
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 p-4">
            {isLoading ? (
              // Skeleton loader
              skeletonArray.map((_, index) => (
                <div key={index} className="w-60 flex-none">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">No featured products available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Featured products will appear here once they are added.</p>
              </div>
            ) : (
              // Actual products
              products.map((product) => (
                <div key={product.id} className="w-60 flex-none">
                  <ProductCard product={product} className="w-3/4 mx-auto" />
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default FeaturedProducts;
