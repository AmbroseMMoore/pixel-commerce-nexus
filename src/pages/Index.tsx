
import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CustomerReviewSlider from "@/components/home/CustomerReviewSlider";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();

  // Simplified logging - only essential tracking
  useEffect(() => {
    console.log('🏠 Homepage loaded');
    
    return () => {
      console.log('🏠 Homepage unloaded');
    };
  }, []);

  return (
    <MainLayout>
      <div data-page="home">
        <HeroSlider />
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
