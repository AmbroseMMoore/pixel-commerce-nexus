
import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";

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
              <ProductCardSkeleton key={index} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products found.</p>
            </div>
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
