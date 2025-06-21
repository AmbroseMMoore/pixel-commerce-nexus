
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
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
      <HeroSection 
        title="Welcome to Little Darling"
        subtitle="Discover amazing products for your little ones"
        ctaText="Shop Now"
        ctaLink="/search"
        image="/lovable-uploads/7fb03b02-a358-4e9c-988c-93ead2836ea4.png"
      />
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
