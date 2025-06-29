
import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'product' | 'organization';
  data: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const generateSchema = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Cutebae",
          "url": "https://cutebae.in",
          "description": "Shop adorable, comfy, and affordable kidswear online at Cutebae.in. Discover stylish outfits for boys & girls with fast delivery & easy exchanges.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://cutebae.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
      
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Cutebae",
          "url": "https://cutebae.in",
          "logo": "https://cutebae.in/og-image.jpg",
          "description": "India's leading online store for trendy and cute kids wear",
          "sameAs": [
            "https://www.instagram.com/cutebae.in",
            "https://www.facebook.com/cutebae.in"
          ]
        };
      
      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.title,
          "description": data.shortDescription,
          "image": data.colorVariants?.[0]?.images?.[0] || "/placeholder.svg",
          "sku": data.id,
          "brand": {
            "@type": "Brand",
            "name": "Cutebae"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price.discounted || data.price.original,
            "priceCurrency": "INR",
            "availability": data.isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Cutebae"
            }
          }
        };
      
      default:
        return null;
    }
  };

  const schema = generateSchema();
  
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData;
