
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

interface SEOProviderProps {
  children: React.ReactNode;
}

const SEOProvider = ({ children }: SEOProviderProps) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
};

export default SEOProvider;
