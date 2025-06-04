
import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { TrendingUp } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TrendingProductsProps {
  products: Product[];
  title?: string;
  isLoading?: boolean;
}

const TrendingProducts = ({ 
  products, 
  title = "Trending Now",
  isLoading = false
}: TrendingProductsProps) => {
  // Create an array of 8 items for the skeleton loader
  const skeletonArray = Array(8).fill(0);
  
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp className="h-6 w-6 text-custom-purple" />
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            {title}
          </h2>
        </div>
        
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
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No trending products available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Trending products will appear here once they are marked as trending.</p>
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

export default TrendingProducts;
