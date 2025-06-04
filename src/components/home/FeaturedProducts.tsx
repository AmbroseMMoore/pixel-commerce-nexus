
import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Create an array of 8 items for the skeleton loader
  const skeletonArray = Array(8).fill(0);
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {title}
        </h2>
        
        {isMobile ? (
          // Mobile: Regular grid layout
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Skeleton loader
              skeletonArray.map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No featured products available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Featured products will appear here once they are added.</p>
              </div>
            ) : (
              // Actual products
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        ) : (
          // Desktop: Horizontal scrolling carousel
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {isLoading ? (
                // Skeleton loader
                skeletonArray.map((_, index) => (
                  <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
              ) : products.length === 0 ? (
                <CarouselItem className="pl-4 basis-full">
                  <div className="text-center py-8">
                    <p className="text-gray-500">No featured products available yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Featured products will appear here once they are added.</p>
                  </div>
                </CarouselItem>
              ) : (
                // Actual products
                products.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
