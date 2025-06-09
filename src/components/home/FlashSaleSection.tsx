
import React, { useState, useEffect } from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import { Product } from "@/types/product";
import { Clock, Zap } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFlashSaleProducts, FlashSaleProduct } from "@/hooks/useFlashSales";

interface FlashSaleSectionProps {
  title?: string;
}

const FlashSaleSection = ({ 
  title = "⚡ Flash Sale"
}: FlashSaleSectionProps) => {
  const isMobile = useIsMobile();
  const { data: flashSaleProducts, isLoading } = useFlashSaleProducts();
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  // Create an array of 8 items for the skeleton loader
  const skeletonArray = Array(8).fill(0);

  // Convert flash sale products to Product format
  const products: Product[] = flashSaleProducts?.map((item: FlashSaleProduct) => ({
    id: item.product_id,
    title: item.product_title,
    slug: item.product_slug,
    price: {
      original: item.original_price,
      discounted: item.sale_price
    },
    colorVariants: [{ id: "", images: ["/placeholder.svg"] }],
    sizeVariants: [{ id: "", name: "", inStock: true }],
    isOutOfStock: false,
    isLowStock: false,
    category: { id: "", name: "", slug: "" },
    subcategory: { id: "", name: "", slug: "" }
  })) || [];

  // Timer countdown
  useEffect(() => {
    if (!flashSaleProducts || flashSaleProducts.length === 0) return;

    const endDate = new Date(flashSaleProducts[0].flash_sale_end_date);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      
      if (distance < 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleProducts]);

  if (!isLoading && (!flashSaleProducts || flashSaleProducts.length === 0)) {
    return null; // Don't show section if no flash sales
  }
  
  return (
    <section className="py-12 bg-gradient-to-r from-red-500 to-pink-500 text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold">
              {title}
            </h2>
          </div>
          
          {timeLeft && timeLeft !== "EXPIRED" && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Clock className="h-5 w-5" />
              <span className="font-mono font-bold text-lg">{timeLeft}</span>
            </div>
          )}
        </div>
        
        {isMobile ? (
          // Mobile: Regular grid layout with minimal spacing
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              // Skeleton loader
              skeletonArray.map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-2">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : (
              // Actual products
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-2 shadow-lg">
                  <ProductCard product={product} />
                </div>
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
                    <div className="bg-white rounded-lg p-2 shadow-lg">
                      <ProductCardSkeleton />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                // Actual products
                products.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="bg-white rounded-lg p-2 shadow-lg">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white hover:bg-white hover:text-red-500" />
            <CarouselNext className="text-white border-white hover:bg-white hover:text-red-500" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FlashSaleSection;
