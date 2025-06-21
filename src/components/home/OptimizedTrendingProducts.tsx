
import React from "react";
import OptimizedProductCard, { OptimizedProductCardSkeleton } from "@/components/products/OptimizedProductCard";
import { useOptimizedTrendingProducts } from "@/hooks/useOptimizedProducts";
import { TrendingUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OptimizedTrendingProductsProps {
  title?: string;
}

const OptimizedTrendingProducts = ({ 
  title = "Trending Now"
}: OptimizedTrendingProductsProps) => {
  const isMobile = useIsMobile();
  const { data: products = [], isLoading, error, isError } = useOptimizedTrendingProducts();
  
  // Create skeleton array
  const skeletonArray = Array(8).fill(0);
  
  if (isError) {
    return (
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-custom-purple" />
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              {title}
            </h2>
          </div>
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load trending products. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  
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
          // Mobile: Regular grid layout
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              skeletonArray.map((_, index) => (
                <OptimizedProductCardSkeleton key={index} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No trending products available yet.</p>
              </div>
            ) : (
              products.slice(0, 6).map((product) => (
                <OptimizedProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        ) : (
          // Desktop: Carousel
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {isLoading ? (
                skeletonArray.map((_, index) => (
                  <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <OptimizedProductCardSkeleton />
                  </CarouselItem>
                ))
              ) : products.length === 0 ? (
                <CarouselItem className="pl-4 basis-full">
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No trending products available yet.</p>
                  </div>
                </CarouselItem>
              ) : (
                products.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <OptimizedProductCard product={product} />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            {!isLoading && products.length > 4 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default OptimizedTrendingProducts;
