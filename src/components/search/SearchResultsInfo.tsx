
import React from 'react';

interface SearchResultsInfoProps {
  count: number;
  searchTerm: string;
  hasFilters: boolean;
}

const SearchResultsInfo = ({ count, searchTerm, hasFilters }: SearchResultsInfoProps) => {
  const getResultsText = () => {
    if (count === 0) {
      return 'No products found';
    }
    
    if (count === 1) {
      return '1 product found';
    }
    
    return `${count} products found`;
  };

  const getSearchContext = () => {
    if (searchTerm && hasFilters) {
      return ` for "${searchTerm}" with filters applied`;
    } else if (searchTerm) {
      return ` for "${searchTerm}"`;
    } else if (hasFilters) {
      return ' with filters applied';
    }
    return '';
  };

  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">{getResultsText()}</span>
      <span>{getSearchContext()}</span>
    </div>
  );
};

export default SearchResultsInfo;
