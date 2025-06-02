
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const { data: products = [], isLoading } = useProducts();

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return false;
    
    const term = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(term) ||
      product.shortDescription?.toLowerCase().includes(term) ||
      product.longDescription?.toLowerCase().includes(term)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original);
      case 'price-high':
        return (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  return (
    <MainLayout>
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
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} products found
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse our categories.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600">Enter a search term to find products.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
