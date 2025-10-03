/**
 * Color Grouping Service
 * Provides functions to group product colors into major color groups
 */

import { Product } from '@/types/product';
import { MAJOR_COLOR_GROUPS, getColorGroup, ColorGroup } from '@/utils/colorGrouping';

export interface GroupedColor extends ColorGroup {
  originalColors: Array<{
    id: string;
    name: string;
    colorCode: string;
  }>;
  productCount?: number;
}

/**
 * Get grouped colors from a list of products
 * Returns the 12 major color groups with their associated product colors
 */
export function getGroupedColorsFromProducts(products: Product[]): GroupedColor[] {
  // Map to store colors by group
  const groupMap = new Map<string, Set<string>>();
  
  // Initialize all major groups
  MAJOR_COLOR_GROUPS.forEach(group => {
    groupMap.set(group.name, new Set());
  });
  
  // Process all products and their color variants
  products.forEach(product => {
    product.colorVariants?.forEach(colorVariant => {
      if (colorVariant.colorCode) {
        const group = getColorGroup(colorVariant.colorCode);
        
        // Store the original color as JSON string to deduplicate
        const colorKey = JSON.stringify({
          id: colorVariant.id,
          name: colorVariant.name,
          colorCode: colorVariant.colorCode
        });
        
        groupMap.get(group.name)?.add(colorKey);
      }
    });
  });
  
  // Convert map to array of GroupedColor objects
  const groupedColors: GroupedColor[] = MAJOR_COLOR_GROUPS.map(group => {
    const colorSet = groupMap.get(group.name) || new Set();
    const originalColors = Array.from(colorSet).map(colorJson => JSON.parse(colorJson));
    
    return {
      ...group,
      originalColors,
      productCount: originalColors.length
    };
  }).filter(group => group.originalColors.length > 0); // Only return groups that have colors
  
  return groupedColors;
}

/**
 * Check if a product has any color in the specified color group
 */
export function productHasColorInGroup(product: Product, groupName: string): boolean {
  if (!product.colorVariants || product.colorVariants.length === 0) {
    return false;
  }
  
  return product.colorVariants.some(colorVariant => {
    if (!colorVariant.colorCode) return false;
    const group = getColorGroup(colorVariant.colorCode);
    return group.name === groupName;
  });
}

/**
 * Filter products by color group
 */
export function filterProductsByColorGroup(products: Product[], groupName: string): Product[] {
  return products.filter(product => productHasColorInGroup(product, groupName));
}

/**
 * Get available color groups from products (only groups that exist in the products)
 */
export function getAvailableColorGroups(products: Product[]): ColorGroup[] {
  const availableGroupNames = new Set<string>();
  
  products.forEach(product => {
    product.colorVariants?.forEach(colorVariant => {
      if (colorVariant.colorCode) {
        const group = getColorGroup(colorVariant.colorCode);
        availableGroupNames.add(group.name);
      }
    });
  });
  
  return MAJOR_COLOR_GROUPS.filter(group => availableGroupNames.has(group.name));
}
