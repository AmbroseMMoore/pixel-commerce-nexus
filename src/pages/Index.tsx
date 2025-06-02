import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import TrendingProducts from "@/components/home/TrendingProducts";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomerReviewSlider from "@/components/home/CustomerReviewSlider";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useTrendingProducts } from "@/hooks/useTrendingProducts";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useLogging } from "@/hooks/useLogging";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: trendingProducts, isLoading: trendingLoading } = useTrendingProducts();
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
        productsLoaded: !productsLoading,
        trendingLoaded: !trendingLoading
      });
    };

    if (!categoriesLoading && !productsLoading && !trendingLoading) {
      handleLoad();
    }

    return () => {
      logInfo('homepage_unloaded', {
        timeSpent: Math.round(performance.now() - startTime)
      });
    };
  }, [categoriesLoading, productsLoading, trendingLoading, logInfo]);

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

    if (trendingLoading === false && (!trendingProducts || trendingProducts.length === 0)) {
      logError('trending_products_load_empty', { trendingCount: trendingProducts?.length || 0 });
    }
  }, [categories, featuredProducts, trendingProducts, categoriesLoading, productsLoading, trendingLoading, logError]);

  return (
    <MainLayout>
      <div data-page="home">
        <HeroSlider />
        <TrendingProducts 
          products={trendingProducts || []} 
          isLoading={trendingLoading}
        />
        <CategorySection categories={categories} isLoading={categoriesLoading} />
        <FeaturedProducts 
          products={featuredProducts || []} 
          isLoading={productsLoading}
        />
        <CustomerReviewSlider />
        <NewsletterSection />
      </div>
    </MainLayout>
  );
};

export default Index;
