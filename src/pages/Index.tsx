
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { cmsContent } from "@/data/mockData";
import { useCategories } from "@/hooks/useCategories";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const { data: featuredProducts, isLoading: isProductsLoading, error: productsError } = useFeaturedProducts();

  const isLoading = isCategoriesLoading || isProductsLoading;
  const hasError = categoriesError || productsError;

  return (
    <MainLayout>
      <HeroSection
        title={cmsContent.hero.title}
        subtitle={cmsContent.hero.subtitle}
        ctaText={cmsContent.hero.ctaText}
        ctaLink={cmsContent.hero.ctaLink}
        image={cmsContent.hero.image}
      />
      
      {hasError && (
        <div className="container-custom py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load data. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!hasError && (
        <>
          <CategorySection 
            categories={categories || []} 
            isLoading={isCategoriesLoading} 
          />
          <FeaturedProducts 
            products={featuredProducts || []} 
            isLoading={isProductsLoading} 
          />
        </>
      )}
      
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;
