
import React from "react";
import { Link } from "react-router-dom";
import { Category } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorySectionProps {
  categories: Category[];
  isLoading?: boolean;
}

const CategorySection = ({ categories, isLoading = false }: CategorySectionProps) => {
  const skeletonArray = Array(6).fill(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Only set fallback once to prevent infinite loop
    if (!target.dataset.fallback) {
      target.dataset.fallback = "true";
      target.src = "https://placehold.co/300x300?text=Category";
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            skeletonArray.map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="aspect-square w-full rounded-lg mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No categories available yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Categories will appear here once they are added.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group"
              >
                <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
                  <img
                    src={
                      category.image ||
                      "https://placehold.co/300x300?text=Category"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-center font-medium text-gray-800 group-hover:text-purple transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-center text-gray-500">
                  {category.subCategories?.length || 0} subcategories
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
