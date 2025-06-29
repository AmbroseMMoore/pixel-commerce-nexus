
import React from 'react';
import { Helmet } from 'react-helmet-async';
import StructuredData from './StructuredData';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: {
    type: 'website' | 'product' | 'organization';
    data?: any;
  };
}

const SEOHead = ({
  title = "Cutebae – Trendy & Cute Kids Wear Online in India",
  description = "Shop adorable, comfy, and affordable kidswear online at Cutebae.in. Discover stylish outfits for boys & girls with fast delivery & easy exchanges.",
  keywords = "kids wear online, baby clothes India, cute dresses for girls, toddler clothing, boys t-shirts, infant outfits, kids fashion India, cutebae kidswear",
  canonicalUrl,
  ogImage = "https://cutebae.in/og-image.jpg",
  noIndex = false,
  structuredData
}: SEOHeadProps) => {
  const currentUrl = canonicalUrl || `https://cutebae.in${window.location.pathname}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Cutebae" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={currentUrl} />
        
        {/* Robots */}
        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="Cutebae" />
        <meta property="og:image" content={ogImage} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@cutebae.in" />
        
        {/* Google Search Console Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
      </Helmet>
      
      {/* Structured Data */}
      {structuredData && (
        <StructuredData type={structuredData.type} data={structuredData.data} />
      )}
    </>
  );
};

export default SEOHead;
