
import React from 'react';
import { Product } from '@/types/product';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchFilters {
  fabric?: string;
  sleeveType?: string;
  neckStyle?: string;
  closureType?: string;
  category?: string;
  priceRange?: string;
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  products: Product[];
}

const AdvancedSearchFilters = ({ filters, onFiltersChange, products }: AdvancedSearchFiltersProps) => {
  // Extract unique values from product specifications
  const getUniqueSpecValues = (specKey: string): string[] => {
    const values = new Set<string>();
    
    products.forEach(product => {
      if (product.specifications && typeof product.specifications === 'object') {
        const specs = product.specifications as Record<string, string>;
        const value = specs[specKey];
        if (value) {
          values.add(value);
        }
      }
    });
    
    return Array.from(values).sort();
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || !value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const fabricOptions = getUniqueSpecValues('fabric');
  const sleeveTypeOptions = getUniqueSpecValues('sleeve_type');
  const neckStyleOptions = getUniqueSpecValues('neck_style');
  const closureTypeOptions = getUniqueSpecValues('closure_type');

  const priceRanges = [
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹1000', value: '500-1000' },
    { label: '₹1000 - ₹1500', value: '1000-1500' },
    { label: '₹1500 - ₹2000', value: '1500-2000' },
    { label: 'Over ₹2000', value: '2000-999999' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <Select
              value={filters.priceRange || 'all'}
              onValueChange={(value) => updateFilter('priceRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All prices</SelectItem>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fabric Filter */}
          {fabricOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
              <Select
                value={filters.fabric || 'all'}
                onValueChange={(value) => updateFilter('fabric', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All fabrics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fabrics</SelectItem>
                  {fabricOptions.map(fabric => (
                    <SelectItem key={fabric} value={fabric}>
                      {fabric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sleeve Type Filter */}
          {sleeveTypeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sleeve Type</label>
              <Select
                value={filters.sleeveType || 'all'}
                onValueChange={(value) => updateFilter('sleeveType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sleeve types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sleeve types</SelectItem>
                  {sleeveTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Neck Style Filter */}
          {neckStyleOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Neck Style</label>
              <Select
                value={filters.neckStyle || 'all'}
                onValueChange={(value) => updateFilter('neckStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All neck styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All neck styles</SelectItem>
                  {neckStyleOptions.map(style => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Closure Type Filter */}
          {closureTypeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Closure Type</label>
              <Select
                value={filters.closureType || 'all'}
                onValueChange={(value) => updateFilter('closureType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All closure types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All closure types</SelectItem>
                  {closureTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilters;
