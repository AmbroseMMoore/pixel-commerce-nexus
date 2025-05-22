
import React from "react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
}

const FeaturedProducts = ({ 
  products, 
  title = "Featured Products" 
}: FeaturedProductsProps) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
