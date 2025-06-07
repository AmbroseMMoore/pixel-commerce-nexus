import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { TrendingUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
        
        {isMobile ? (
          // Mobile: Regular grid layout with minimal spacing
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {isLoading ? (
              // Skeleton loader
              skeletonArray.map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No trending products available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Trending products will appear here once they are marked as trending.</p>
              </div>
            ) : (
              // Actual products
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        ) : (
          // Desktop: Horizontal scrolling carousel with minimal spacing
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1">
              {isLoading ? (
                // Skeleton loader
                skeletonArray.map((_, index) => (
                  <CarouselItem key={index} className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
              ) : products.length === 0 ? (
                <CarouselItem className="pl-1 basis-full">
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No trending products available yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Trending products will appear here once they are marked as trending.</p>
                  </div>
                </CarouselItem>
              ) : (
                // Actual products
                products.map((product) => (
                  <CarouselItem key={product.id} className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4">
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

export default TrendingProducts;
