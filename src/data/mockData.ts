
import { Category, Product, SubCategory } from "@/types/product";
import { OrderStatus, PaymentStatus, User } from "@/types/user";

// Main categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Boys",
    slug: "boys",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "2",
    name: "Girls",
    slug: "girls",
    image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "3",
    name: "Toys",
    slug: "toys",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "4",
    name: "Shoes",
    slug: "shoes",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2afe5f9?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "5",
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "6",
    name: "New Born",
    slug: "new-born",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  }
];

// Sub categories
export const subCategories: SubCategory[] = [
  { id: "101", name: "T-Shirts", slug: "boys-tshirts", categoryId: "1" },
  { id: "102", name: "Jeans", slug: "boys-jeans", categoryId: "1" },
  { id: "103", name: "Shirts", slug: "boys-shirts", categoryId: "1" },
  { id: "201", name: "Dresses", slug: "girls-dresses", categoryId: "2" },
  { id: "202", name: "Tops", slug: "girls-tops", categoryId: "2" },
  { id: "203", name: "Skirts", slug: "girls-skirts", categoryId: "2" },
  { id: "301", name: "Action Figures", slug: "toys-action-figures", categoryId: "3" },
  { id: "302", name: "Board Games", slug: "toys-board-games", categoryId: "3" },
  { id: "303", name: "Puzzles", slug: "toys-puzzles", categoryId: "3" },
  { id: "401", name: "Sneakers", slug: "shoes-sneakers", categoryId: "4" },
  { id: "402", name: "Sandals", slug: "shoes-sandals", categoryId: "4" },
  { id: "403", name: "Boots", slug: "shoes-boots", categoryId: "4" },
  { id: "501", name: "Watches", slug: "accessories-watches", categoryId: "5" },
  { id: "502", name: "Bags", slug: "accessories-bags", categoryId: "5" },
  { id: "503", name: "Jewelry", slug: "accessories-jewelry", categoryId: "5" },
  { id: "601", name: "Onesies", slug: "new-born-onesies", categoryId: "6" },
  { id: "602", name: "Bibs", slug: "new-born-bibs", categoryId: "6" },
  { id: "603", name: "Blankets", slug: "new-born-blankets", categoryId: "6" }
];

// Update categories with subCategories
categories.forEach(category => {
  category.subCategories = subCategories.filter(sub => sub.categoryId === category.id);
});

// Add sample products for each subcategory
const generateSampleProducts = () => {
  let productsList: Product[] = [];
  let productId = 1001;
  
  const ageRangesOptions = [
    ["0-6 months", "6-12 months"],
    ["1-2 years", "2-3 years"],
    ["3-5 years", "5-8 years"],
    ["8-12 years"],
    ["12+ years"]
  ];
  
  subCategories.forEach(subCategory => {
    // Create 1-2 products per subcategory
    const numProducts = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numProducts; i++) {
      const categoryName = categories.find(c => c.id === subCategory.categoryId)?.name || "";
      const productName = `${categoryName} ${subCategory.name} ${i + 1}`;
      const randomAgeRanges = ageRangesOptions[Math.floor(Math.random() * ageRangesOptions.length)];
      
      // Generate base price for the product
      const basePrice = Math.floor(Math.random() * 2000) + 999;
      const hasDiscount = Math.random() > 0.5;
      const baseDiscountedPrice = hasDiscount ? Math.floor(Math.random() * 1000) + 699 : undefined;
      
      productsList.push({
        id: productId.toString(),
        title: productName,
        slug: productName.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: `Quality ${subCategory.name.toLowerCase()} for ${categoryName.toLowerCase()}`,
        longDescription: `This is a high-quality item in our ${subCategory.name} collection designed specifically for ${categoryName}. Made with premium materials for comfort and durability.`,
        price: {
          original: basePrice,
          discounted: baseDiscountedPrice
        },
        categoryId: subCategory.categoryId,
        subCategoryId: subCategory.id,
        colorVariants: [
          {
            id: "c1",
            name: "Blue",
            colorCode: "#1E90FF",
            images: [
              "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600",
            ]
          },
          {
            id: "c2",
            name: "Pink",
            colorCode: "#FFC0CB",
            images: [
              "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=600",
            ]
          }
        ],
        sizeVariants: [
          { 
            id: "s1", 
            name: "S", 
            inStock: true,
            priceOriginal: basePrice - 100, // Small size slightly cheaper
            priceDiscounted: baseDiscountedPrice ? baseDiscountedPrice - 100 : undefined
          },
          { 
            id: "s2", 
            name: "M", 
            inStock: true,
            priceOriginal: basePrice, // Medium size base price
            priceDiscounted: baseDiscountedPrice
          },
          { 
            id: "s3", 
            name: "L", 
            inStock: Math.random() > 0.2,
            priceOriginal: basePrice + 100, // Large size slightly more expensive
            priceDiscounted: baseDiscountedPrice ? baseDiscountedPrice + 100 : undefined
          },
          { 
            id: "s4", 
            name: "XL", 
            inStock: Math.random() > 0.4,
            priceOriginal: basePrice + 200, // XL size most expensive
            priceDiscounted: baseDiscountedPrice ? baseDiscountedPrice + 200 : undefined
          }
        ],
        ageRanges: randomAgeRanges,
        specifications: {
          "Material": "Premium Quality",
          "Fit": "Regular",
          "Care": "Machine wash cold",
          "Origin": "Made in India"
        },
        isLowStock: Math.random() > 0.7,
        isOutOfStock: false,
        isFeatured: Math.random() > 0.7,
        isTrending: Math.random() > 0.8,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      productId++;
    }
  });
  
  return productsList;
};

// Generate products for all subcategories
export const products: Product[] = generateSampleProducts();

// Mock User
export const mockUser: User = {
  id: "u1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100",
};

// CMS Content
export const cmsContent = {
  hero: {
    title: "Cutebae Collection 2024",
    subtitle: "Discover the latest trends for the season",
    ctaText: "Shop Now",
    ctaLink: "/category/new-arrivals",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200"
  },
  popup: {
    title: "Get 20% Off Your First Order",
    description: "Sign up for our newsletter and receive a discount code",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=600",
    buttonText: "Sign Up",
    expiryDate: new Date("2024-12-31")
  }
};
