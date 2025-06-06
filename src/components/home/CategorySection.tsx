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

  // Category images mapping
  const categoryImages = {
    "Hair Accessories": "/lovable-uploads/de96e29f-2141-4f47-8735-371f7985eca9.png",
    "Boys": "/lovable-uploads/f65079a7-32ec-4987-ac01-ea10c67d3635.png", 
    "Girls": "/lovable-uploads/83ece4fa-a270-41b5-babf-65c606e535b7.png",
    "Baby": "/lovable-uploads/fc4bf32c-8a89-4bba-b0c8-f8e855728cfe.png",
    "New Born": "/lovable-uploads/6527e76f-41d3-4cce-8169-f52f1a936765.png",
    "Shoes": "/lovable-uploads/1fc2e9ae-2c60-4477-98e0-3a17219db300.png",
    "Toys": "/lovable-uploads/97e7a339-6aba-4a6b-88b7-49bfd10e54d3.png"
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (!target.dataset.fallback) {
      target.dataset.fallback = "true";
      target.src = "https://placehold.co/300x375?text=Category";
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
                <Skeleton className="w-full aspect-[4/5] rounded-lg mb-2" />
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
                <div className="w-full aspect-[4/5] relative overflow-hidden rounded-lg mb-2">
                  <img
                    src={
                      categoryImages[category.name as keyof typeof categoryImages] ||
                      category.image ||
                      "https://placehold.co/300x375?text=Category"
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
