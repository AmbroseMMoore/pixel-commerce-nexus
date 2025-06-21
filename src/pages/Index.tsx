
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import OptimizedFeaturedProducts from "@/components/home/OptimizedFeaturedProducts";
import OptimizedTrendingProducts from "@/components/home/OptimizedTrendingProducts";
import CustomerReviewSlider from "@/components/home/CustomerReviewSlider";
import NewsletterSection from "@/components/home/NewsletterSection";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <CategorySection />
      <OptimizedFeaturedProducts />
      <OptimizedTrendingProducts />
      <CustomerReviewSlider />
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;
