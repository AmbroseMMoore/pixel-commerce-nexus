
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/products/ProductCard";
import AdvancedSearchFilters from "@/components/search/AdvancedSearchFilters";
import SearchResultsInfo from "@/components/search/SearchResultsInfo";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";

interface SearchFilters {
  fabric?: string;
  sleeveType?: string;
  neckStyle?: string;
  closureType?: string;
  category?: string;
  priceRange?: string;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { data: products = [], isLoading } = useProducts();

  // Enhanced search function that includes specifications
  const searchInProduct = (product: Product, term: string): { matches: boolean; matchedSpec?: string } => {
    if (!term.trim()) return { matches: false };
    
    const searchTerm = term.toLowerCase();
    
    // Search in basic product fields
    const basicFields = [
      product.title,
      product.shortDescription || '',
      product.longDescription || ''
    ];
    
    const basicMatch = basicFields.some(field => 
      field.toLowerCase().includes(searchTerm)
    );
    
    if (basicMatch) {
      return { matches: true };
    }
    
    // Search in specifications
    if (product.specifications) {
      let matchedSpec = '';
      
      if (Array.isArray(product.specifications)) {
        // Handle array format specifications
        const specMatch = product.specifications.some(spec => 
          spec.toLowerCase().includes(searchTerm)
        );
        if (specMatch) {
          matchedSpec = product.specifications.find(spec => 
            spec.toLowerCase().includes(searchTerm)
          ) || '';
          return { matches: true, matchedSpec };
        }
      } else if (typeof product.specifications === 'object') {
        // Handle object format specifications
        for (const [key, value] of Object.entries(product.specifications)) {
          const keyMatch = key.toLowerCase().includes(searchTerm);
          const valueMatch = value.toString().toLowerCase().includes(searchTerm);
          
          if (keyMatch || valueMatch) {
            matchedSpec = `${key}: ${value}`;
            return { matches: true, matchedSpec };
          }
        }
      }
    }
    
    return { matches: false };
  };

  // Apply filters to products
  const applyFilters = (products: Product[], filters: SearchFilters): Product[] => {
    return products.filter(product => {
      // Category filter
      if (filters.category && !product.categoryId.includes(filters.category)) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange) {
        const price = product.price.discounted || product.price.original;
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (price < min || (max && price > max)) {
          return false;
        }
      }
      
      // Specification filters
      if (product.specifications && typeof product.specifications === 'object') {
        const specs = product.specifications as Record<string, string>;
        
        if (filters.fabric && !specs.fabric?.toLowerCase().includes(filters.fabric.toLowerCase())) {
          return false;
        }
        
        if (filters.sleeveType && !specs.sleeve_type?.toLowerCase().includes(filters.sleeveType.toLowerCase())) {
          return false;
        }
        
        if (filters.neckStyle && !specs.neck_style?.toLowerCase().includes(filters.neckStyle.toLowerCase())) {
          return false;
        }
        
        if (filters.closureType && !specs.closure_type?.toLowerCase().includes(filters.closureType.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Filter and search products
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() && Object.keys(filters).length === 0) {
      return [];
    }
    
    let results = products;
    
    // Apply search term
    if (searchTerm.trim()) {
      results = products.filter(product => {
        const { matches } = searchInProduct(product, searchTerm);
        return matches;
      }).map(product => ({
        ...product,
        searchMatch: searchInProduct(product, searchTerm)
      }));
    }
    
    // Apply additional filters
    results = applyFilters(results, filters);
    
    return results;
  }, [products, searchTerm, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const results = [...searchResults];
    
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original);
        case 'price-high':
          return (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [searchResults, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  return (
    <MainLayout
      seoTitle={searchTerm ? `Search Results for "${searchTerm}" - Cutebae` : 'Search Products - Cutebae'}
      seoDescription={searchTerm ? `Find "${searchTerm}" in our collection of cute kids wear` : 'Search through our collection of adorable kids clothing by product name, description, or specifications'}
      seoKeywords="search kids clothes, find baby wear, children clothing search, kids fashion search"
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Search Products'}
            </h1>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search by name, description, or specifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-custom-purple text-white text-xs rounded-full px-2 py-1">
                    {Object.keys(filters).length}
                  </span>
                )}
              </Button>
            </form>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {Object.entries(filters).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 bg-custom-purple text-white text-xs px-2 py-1 rounded-full"
                  >
                    {key}: {value}
                    <button
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters[key as keyof SearchFilters];
                        setFilters(newFilters);
                      }}
                      className="ml-1 hover:bg-white hover:text-custom-purple rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-custom-purple"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <AdvancedSearchFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                products={products}
              />
            )}

            {/* Results Info and Sort */}
            <div className="flex items-center justify-between">
              <SearchResultsInfo 
                count={sortedProducts.length}
                searchTerm={searchTerm}
                hasFilters={hasActiveFilters}
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-custom-purple"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                  {/* Show what matched in search */}
                  {searchTerm && (product as any).searchMatch?.matchedSpec && (
                    <div className="mt-2 text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">
                      Matched: {(product as any).searchMatch.matchedSpec}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm || hasActiveFilters ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 
                  `No products match "${searchTerm}"${hasActiveFilters ? ' with the selected filters' : ''}.` :
                  'No products match the selected filters.'
                }
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Checking your spelling</li>
                  <li>• Using more general terms</li>
                  <li>• Searching for fabric types (cotton, polyester)</li>
                  <li>• Looking for style features (sleeve type, neck style)</li>
                  {hasActiveFilters && <li>• Removing some filters</li>}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600">Enter a search term to find products by name, description, or specifications.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
