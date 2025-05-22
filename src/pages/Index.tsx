
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { categories, cmsContent, products } from "@/data/mockData";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection
        title={cmsContent.hero.title}
        subtitle={cmsContent.hero.subtitle}
        ctaText={cmsContent.hero.ctaText}
        ctaLink={cmsContent.hero.ctaLink}
        image={cmsContent.hero.image}
      />
      <CategorySection categories={categories} />
      <FeaturedProducts products={products} />
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;
