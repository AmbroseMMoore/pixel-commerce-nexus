
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import CategorySection from "@/components/home/CategorySection";
import OptimizedFeaturedProducts from "@/components/home/OptimizedFeaturedProducts";
import OptimizedTrendingProducts from "@/components/home/OptimizedTrendingProducts";
import CustomerReviewSlider from "@/components/home/CustomerReviewSlider";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();

  return (
    <MainLayout>
      <HeroSlider />
      <CategorySection 
        categories={categories}
        isLoading={categoriesLoading}
      />
      <OptimizedFeaturedProducts />
      <OptimizedTrendingProducts />
      <CustomerReviewSlider />
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;
