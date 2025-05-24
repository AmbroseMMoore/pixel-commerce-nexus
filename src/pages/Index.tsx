
import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useCacheManager } from "@/hooks/useCacheManager";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { getCacheStats } = useCacheManager();

  // Log cache stats periodically for monitoring (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const logStats = () => {
      const stats = getCacheStats();
      console.log('Cache Stats:', stats);
    };

    // Log stats every 5 minutes
    const interval = setInterval(logStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getCacheStats]);

  return (
    <MainLayout>
      <HeroSection 
        title="Welcome to CuteBae"
        subtitle="Discover amazing products for kids"
        ctaText="Shop Now"
        ctaLink="/category/boys"
        image="/placeholder.svg"
      />
      <CategorySection categories={categories} isLoading={categoriesLoading} />
      <FeaturedProducts 
        products={featuredProducts || []} 
        isLoading={productsLoading}
      />
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;
