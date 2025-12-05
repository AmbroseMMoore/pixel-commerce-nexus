
import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { useOptimizedFeaturedProducts } from "@/hooks/useOptimizedProducts";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OptimizedFeaturedProductsProps {
  title?: string;
}

const OptimizedFeaturedProducts = ({ 
  title = "New Launches"
}: OptimizedFeaturedProductsProps) => {
  const isMobile = useIsMobile();
  const { data: products = [], isLoading, error, isError } = useOptimizedFeaturedProducts();
  
  // Create skeleton array
  const skeletonArray = Array(8).fill(0);
  
  if (isError) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {title}
          </h2>
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load new launch products. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {title}
        </h2>
        
        {isMobile ? (
          // Mobile: Regular grid layout using ProductCard
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              skeletonArray.map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No new launch products available yet.</p>
              </div>
            ) : (
              products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        ) : (
          // Desktop: Carousel using ProductCard
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
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
              ) : products.length === 0 ? (
                <CarouselItem className="pl-4 basis-full">
                  <div className="text-center py-8">
                    <p className="text-gray-500">No new launch products available yet.</p>
                  </div>
                </CarouselItem>
              ) : (
                products.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={product} />
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

export default OptimizedFeaturedProducts;
