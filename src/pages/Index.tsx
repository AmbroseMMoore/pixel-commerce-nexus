
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
    <MainLayout
      seoTitle="Cutebae – Trendy & Cute Kids Wear Online in India | Best Baby Clothes"
      seoDescription="Shop adorable, comfy, and affordable kidswear online at Cutebae.in. Discover stylish outfits for boys & girls aged 0-12 years with fast delivery & easy exchanges across India."
      seoKeywords="kids wear online India, baby clothes online, cute dresses for girls, boys t-shirts, toddler clothing, infant outfits, kids fashion, children clothes, cutebae kidswear, trendy kids clothes"
      canonicalUrl="https://cutebae.in/"
      structuredData={{
        type: 'website',
        data: {}
      }}
    >
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
