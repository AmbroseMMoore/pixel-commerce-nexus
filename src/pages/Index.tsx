
import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useLogging } from "@/hooks/useLogging";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { getCacheStats } = useCacheManager();
  const { logInfo, logError } = useLogging();

  // Log page load and track performance
  useEffect(() => {
    const startTime = performance.now();
    
    logInfo('homepage_loaded', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // Track load performance
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      logInfo('homepage_performance', {
        loadTime: Math.round(loadTime),
        categoriesLoaded: !categoriesLoading,
        productsLoaded: !productsLoading
      });
    };

    if (!categoriesLoading && !productsLoading) {
      handleLoad();
    }

    return () => {
      logInfo('homepage_unloaded', {
        timeSpent: Math.round(performance.now() - startTime)
      });
    };
  }, [categoriesLoading, productsLoading, logInfo]);

  // Log cache stats periodically for monitoring (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const logStats = () => {
      try {
        const stats = getCacheStats();
        console.log('Cache Stats:', stats);
        logInfo('cache_stats', stats);
      } catch (error) {
        logError('cache_stats_error', { error: error instanceof Error ? error.message : error });
      }
    };

    // Log stats every 5 minutes
    const interval = setInterval(logStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getCacheStats, logInfo, logError]);

  // Log data loading errors
  useEffect(() => {
    if (categoriesLoading === false && (!categories || categories.length === 0)) {
      logError('categories_load_empty', { categoriesCount: categories?.length || 0 });
    }
    
    if (productsLoading === false && (!featuredProducts || featuredProducts.length === 0)) {
      logError('featured_products_load_empty', { productsCount: featuredProducts?.length || 0 });
    }
  }, [categories, featuredProducts, categoriesLoading, productsLoading, logError]);

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
