import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import PopupModal from "../PopupModal";
import SEOHead from "../seo/SEOHead";
import StructuredData from "../seo/StructuredData";
import ProductAssistant from "../chat/ProductAssistant";

interface MainLayoutProps {
  children: React.ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: {
    type: 'website' | 'product' | 'organization';
    data?: any;
  };
}

const MainLayout = ({ 
  children, 
  seoTitle,
  seoDescription,
  seoKeywords,
  canonicalUrl,
  ogImage,
  noIndex,
  structuredData
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        noIndex={noIndex}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <PopupModal />
      <ProductAssistant />
      
      {/* Global Organization Schema */}
      <StructuredData type="organization" data={{}} />
    </div>
  );
};

export default MainLayout;
