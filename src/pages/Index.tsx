
import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import CustomerReviewSlider from "@/components/home/CustomerReviewSlider";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useNewArrivals } from "@/hooks/useNewArrivals";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useLogging } from "@/hooks/useLogging";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals();
  const { getCacheStats } = useCacheManager();
  const { logInfo, logError } = useLogging();

  // Mock data for hero slides - this would come from CMS in the future
  const heroSlides = [
    {
      id: "1",
      title: "Welcome to CuteBae",
      subtitle: "Discover amazing products for kids",
      ctaText: "Shop Now",
      ctaLink: "/category/boys",
      image: "/placeholder.svg"
    },
    {
      id: "2", 
      title: "Summer Collection 2024",
      subtitle: "Fresh styles for the new season",
      ctaText: "Explore Collection",
      ctaLink: "/category/girls",
      image: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Special Offers",
      subtitle: "Up to 50% off on selected items",
      ctaText: "Shop Deals",
      ctaLink: "/category/boys",
      image: "/placeholder.svg"
    }
  ];

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

    const interval = setInterval(logStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getCacheStats, logInfo, logError]);

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
      <div className="home-page">
        <HeroSlider slides={heroSlides} />
        <CategorySection categories={categories} isLoading={categoriesLoading} />
        <NewArrivals 
          products={newArrivals || []} 
          isLoading={newArrivalsLoading}
        />
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
