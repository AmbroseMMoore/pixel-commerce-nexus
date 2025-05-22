
import React from "react";
import { Link } from "react-router-dom";
import { Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorySectionProps {
  categories: Category[];
  isLoading?: boolean;
}

const CategorySection = ({ categories, isLoading = false }: CategorySectionProps) => {
  // Create an array of 6 items for the skeleton loader
  const skeletonArray = Array(6).fill(0);
  
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Skeleton loader
            skeletonArray.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="aspect-square w-full rounded-lg mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
              </div>
            ))
          ) : (
            // Actual categories
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group"
              >
                <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
                  <img
                    src={category.image || "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=300"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-center font-medium text-gray-800 group-hover:text-purple transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
