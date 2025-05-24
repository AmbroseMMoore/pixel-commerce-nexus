
// Test data for creating the product
export const testProductData = {
  title: "Test Product",
  slug: "test-product",
  short_description: "This is a test product for the Boys category under Test 4 subcategory",
  price_original: 99.99,
  category_id: "", // Will be filled with Boys category ID
  subcategory_id: "", // Will be filled with Test 4 subcategory ID
  is_featured: false,
  is_trending: false,
  stock_quantity: 10,
  specifications: {
    "Material": "Cotton",
    "Size": "Medium",
    "Color": "Blue"
  }
};

// Boys category data (if it doesn't exist)
export const boysCategory = {
  name: "Boys",
  slug: "boys",
  image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop"
};

// Test 4 subcategory data (if it doesn't exist)
export const test4Subcategory = {
  name: "Test 4",
  slug: "test-4",
  category_id: "" // Will be filled with Boys category ID
};
