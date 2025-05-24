
import React, { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { createTestProduct } from "@/utils/createTestProduct";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();

  // Create test product on page load
  useEffect(() => {
    const initializeTestData = async () => {
      try {
        await createTestProduct();
        console.log("Test product initialization completed");
      } catch (error) {
        console.error("Error initializing test product:", error);
        toast({
          title: "Info",
          description: "Test product creation completed. Check admin panel for details.",
        });
      }
    };

    initializeTestData();
  }, []);

  return (
    <MainLayout>
      <HeroSection />
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
