import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { Product, SubCategory } from "@/types/product";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useProductsByCategory } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: categoryProducts = [], isLoading: productsLoading, error: productsError } = useProductsByCategory(slug || "");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);

  // Find the current category
  const category = categories.find((c) => c.slug === slug);

  // Get subcategories for this category
  const categorySubCategories = category?.subCategories || [];

  // Get all available colors from products
  const availableColors = Array.from(
    new Set(
      categoryProducts.flatMap((product) =>
        product.colorVariants.map((cv) => ({
          name: cv.name,
          colorCode: cv.colorCode,
        }))
      )
    ).values()
  );

  // Get all available sizes from products
  const availableSizes = Array.from(
    new Set(
      categoryProducts.flatMap((product) =>
        product.sizeVariants.map((sv) => sv.name)
      )
    ).values()
  );

  // Get all available age ranges from products
  const availableAgeRanges = Array.from(
    new Set(
      categoryProducts.flatMap((product) => product.ageRanges || [])
    ).values()
  ).sort();

  // Apply filters to products
  const filteredProducts = categoryProducts.filter((product) => {
    // Filter by subcategory
    if (
      selectedSubCategories.length > 0 &&
      !selectedSubCategories.includes(product.subCategoryId)
    ) {
      return false;
    }

    // Filter by color
    if (selectedColors.length > 0) {
      const productColors = product.colorVariants.map((cv) => cv.name);
      if (!selectedColors.some((color) => productColors.includes(color))) {
        return false;
      }
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      const productSizes = product.sizeVariants.map((sv) => sv.name);
      if (!selectedSizes.some((size) => productSizes.includes(size))) {
        return false;
      }
    }

    // Filter by age range
    if (selectedAgeRanges.length > 0) {
      const productAgeRanges = product.ageRanges || [];
      if (!selectedAgeRanges.some((ageRange) => productAgeRanges.includes(ageRange))) {
        return false;
      }
    }

    return true;
  });

  const toggleSubCategory = (id: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(id)
        ? prev.filter((subCatId) => subCatId !== id)
        : [...prev, id]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleAgeRange = (ageRange: string) => {
    setSelectedAgeRanges((prev) =>
      prev.includes(ageRange)
        ? prev.filter((ar) => ar !== ageRange)
        : [...prev, ageRange]
    );
  };

  const clearFilters = () => {
    setSelectedSubCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedAgeRanges([]);
  };

  // Check if any filter is active
  const hasActiveFilters =
    selectedSubCategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    selectedAgeRanges.length > 0;

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-6">
          <div className="container-custom">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (categoriesError || productsError) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load category data. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  // If category doesn't exist
  if (!category) {
    return (
      <MainLayout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Category Not Found</h1>
          <p>The category you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-6">
        <div className="container-custom">
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm h-8 px-2"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Subcategories Filter */}
              {categorySubCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Subcategories</h3>
                  <div className="space-y-2">
                    {categorySubCategories.map((subCategory) => (
                      <div key={subCategory.id} className="flex items-center">
                        <Checkbox
                          id={`subcategory-${subCategory.id}`}
                          checked={selectedSubCategories.includes(subCategory.id)}
                          onCheckedChange={() => toggleSubCategory(subCategory.id)}
                        />
                        <Label
                          htmlFor={`subcategory-${subCategory.id}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {subCategory.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Age Ranges Filter */}
              {availableAgeRanges.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Age Range</h3>
                  <div className="space-y-2">
                    {availableAgeRanges.map((ageRange) => (
                      <div key={ageRange} className="flex items-center">
                        <Checkbox
                          id={`age-${ageRange}`}
                          checked={selectedAgeRanges.includes(ageRange)}
                          onCheckedChange={() => toggleAgeRange(ageRange)}
                        />
                        <Label
                          htmlFor={`age-${ageRange}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {ageRange}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Colors Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => toggleColor(color.name)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        selectedColors.includes(color.name)
                          ? "border-brand"
                          : "border-transparent"
                      )}
                      title={color.name}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{ backgroundColor: color.colorCode }}
                      ></span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sizes Filter */}
              <div>
                <h3 className="font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "flex h-8 min-w-8 px-2 items-center justify-center rounded border text-sm",
                        selectedSizes.includes(size)
                          ? "border-brand bg-brand/10 text-brand font-medium"
                          : "border-gray-200"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selectedSubCategories.length +
                      selectedColors.length +
                      selectedSizes.length +
                      selectedAgeRanges.length}
                  </span>
                )}
              </Button>

              <div className="text-sm text-gray-500">
                {filteredProducts.length} products
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {isFilterOpen && (
              <div className="md:hidden bg-white p-4 rounded-lg shadow-lg mb-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>

                {/* Mobile Subcategories */}
                {categorySubCategories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Subcategories</h3>
                    <div className="space-y-2">
                      {categorySubCategories.map((subCategory) => (
                        <div key={subCategory.id} className="flex items-center">
                          <Checkbox
                            id={`mobile-subcategory-${subCategory.id}`}
                            checked={selectedSubCategories.includes(subCategory.id)}
                            onCheckedChange={() => toggleSubCategory(subCategory.id)}
                          />
                          <Label
                            htmlFor={`mobile-subcategory-${subCategory.id}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {subCategory.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Mobile Age Ranges */}
                {availableAgeRanges.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Age Range</h3>
                    <div className="space-y-2">
                      {availableAgeRanges.map((ageRange) => (
                        <div key={ageRange} className="flex items-center">
                          <Checkbox
                            id={`mobile-age-${ageRange}`}
                            checked={selectedAgeRanges.includes(ageRange)}
                            onCheckedChange={() => toggleAgeRange(ageRange)}
                          />
                          <Label
                            htmlFor={`mobile-age-${ageRange}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {ageRange}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Mobile Colors */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => toggleColor(color.name)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2",
                          selectedColors.includes(color.name)
                            ? "border-brand"
                            : "border-transparent"
                        )}
                        title={color.name}
                      >
                        <span
                          className="block w-full h-full rounded-full"
                          style={{ backgroundColor: color.colorCode }}
                        ></span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Mobile Sizes */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSize(size)}
                        className={cn(
                          "flex h-8 min-w-8 px-2 items-center justify-center rounded border text-sm",
                          selectedSizes.includes(size)
                            ? "border-brand bg-brand/10 text-brand font-medium"
                            : "border-gray-200"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="flex items-center gap-1"
                  >
                    <FilterX size={16} />
                    <span>Clear All</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-brand hover:bg-brand-dark"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  Try changing your filters or check back later for new products.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="bg-brand hover:bg-brand-dark">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// X component for the mobile filter close button
const X = ({ size }: { size: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
};

export default CategoryPage;
