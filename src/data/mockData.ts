
import { Category, Product, SubCategory } from "@/types/product";
import { OrderStatus, PaymentStatus, User } from "@/types/user";

// Main categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Men",
    slug: "men",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "2",
    name: "Women",
    slug: "women",
    image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "3",
    name: "Kids",
    slug: "kids",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1576053139778-7e32f2afe5f9?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "5",
    name: "Home",
    slug: "home",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  },
  {
    id: "6",
    name: "Sale",
    slug: "sale",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=500&h=500",
    subCategories: []
  }
];

// Sub categories
export const subCategories: SubCategory[] = [
  { id: "101", name: "T-Shirts", slug: "men-tshirts", categoryId: "1" },
  { id: "102", name: "Jeans", slug: "men-jeans", categoryId: "1" },
  { id: "103", name: "Shoes", slug: "men-shoes", categoryId: "1" },
  { id: "201", name: "Dresses", slug: "women-dresses", categoryId: "2" },
  { id: "202", name: "Tops", slug: "women-tops", categoryId: "2" },
  { id: "203", name: "Shoes", slug: "women-shoes", categoryId: "2" },
  { id: "301", name: "Boys", slug: "kids-boys", categoryId: "3" },
  { id: "302", name: "Girls", slug: "kids-girls", categoryId: "3" },
  { id: "401", name: "Watches", slug: "accessories-watches", categoryId: "4" },
  { id: "402", name: "Bags", slug: "accessories-bags", categoryId: "4" },
  { id: "501", name: "Decor", slug: "home-decor", categoryId: "5" },
  { id: "502", name: "Kitchenware", slug: "home-kitchenware", categoryId: "5" },
];

// Update categories with subCategories
categories.forEach(category => {
  category.subCategories = subCategories.filter(sub => sub.categoryId === category.id);
});

// Mock products
export const products: Product[] = [
  {
    id: "1001",
    title: "Premium Cotton T-Shirt",
    slug: "premium-cotton-tshirt",
    shortDescription: "Comfortable 100% cotton t-shirt for everyday wear",
    longDescription: "This premium quality cotton t-shirt offers exceptional comfort and style for everyday wear. Made from 100% organic cotton that's gentle on your skin and durable for long-lasting use. The classic fit makes it versatile for any casual occasion.",
    price: {
      original: 29.99,
      discounted: 24.99
    },
    categoryId: "1",
    subCategoryId: "101",
    colorVariants: [
      {
        id: "c1",
        name: "Black",
        colorCode: "#000000",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "c2",
        name: "White",
        colorCode: "#FFFFFF",
        images: [
          "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "c3",
        name: "Navy",
        colorCode: "#000080",
        images: [
          "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1582023617394-9f99c82473b5?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=600"
        ]
      }
    ],
    sizeVariants: [
      { id: "s1", name: "S", inStock: true },
      { id: "s2", name: "M", inStock: true },
      { id: "s3", name: "L", inStock: true },
      { id: "s4", name: "XL", inStock: false }
    ],
    specifications: {
      "Material": "100% Organic Cotton",
      "Fit": "Regular",
      "Care": "Machine wash cold, tumble dry low",
      "Origin": "Made in Portugal"
    },
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-05-20")
  },
  {
    id: "1002",
    title: "Slim Fit Jeans",
    slug: "slim-fit-jeans",
    shortDescription: "Classic slim fit jeans with stretch comfort",
    longDescription: "These classic slim fit jeans combine style with all-day comfort. The premium denim includes just the right amount of stretch to move with you while maintaining its shape. Five-pocket styling and a versatile wash make these jeans a wardrobe essential.",
    price: {
      original: 79.99,
      discounted: 59.99
    },
    categoryId: "1",
    subCategoryId: "102",
    colorVariants: [
      {
        id: "c1",
        name: "Dark Blue",
        colorCode: "#00008B",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "c2",
        name: "Black",
        colorCode: "#000000",
        images: [
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1649899135917-ad3dd0b0ed89?auto=format&fit=crop&q=80&w=600"
        ]
      }
    ],
    sizeVariants: [
      { id: "s1", name: "30x30", inStock: true },
      { id: "s2", name: "32x30", inStock: true },
      { id: "s3", name: "34x30", inStock: true },
      { id: "s4", name: "36x30", inStock: false },
      { id: "s5", name: "38x30", inStock: true }
    ],
    specifications: {
      "Material": "98% Cotton, 2% Elastane",
      "Fit": "Slim",
      "Rise": "Mid-rise",
      "Leg": "Straight",
      "Care": "Machine wash cold, inside out"
    },
    isLowStock: true,
    isOutOfStock: false,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-06-05")
  },
  {
    id: "2001",
    title: "Floral Summer Dress",
    slug: "floral-summer-dress",
    shortDescription: "Lightweight floral dress perfect for summer",
    longDescription: "This beautiful floral dress is designed for warm summer days. Made from lightweight, breathable fabric with a flattering A-line silhouette. The vibrant floral pattern brings a touch of nature to your wardrobe, while the comfortable design ensures you'll feel as good as you look.",
    price: {
      original: 59.99,
      discounted: 49.99
    },
    categoryId: "2",
    subCategoryId: "201",
    colorVariants: [
      {
        id: "c1",
        name: "Blue Floral",
        colorCode: "#1E90FF",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1526725702345-bdda2b97ef73?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1540174053853-1cc5d1e4975d?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "c2",
        name: "Pink Floral",
        colorCode: "#FFC0CB",
        images: [
          "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1600094288338-9830ce8dde44?auto=format&fit=crop&q=80&w=600"
        ]
      }
    ],
    sizeVariants: [
      { id: "s1", name: "XS", inStock: true },
      { id: "s2", name: "S", inStock: true },
      { id: "s3", name: "M", inStock: false },
      { id: "s4", name: "L", inStock: true }
    ],
    specifications: {
      "Material": "100% Viscose",
      "Length": "Midi",
      "Fit": "A-line",
      "Features": "Adjustable straps, side pockets",
      "Care": "Hand wash cold, line dry"
    },
    isLowStock: false,
    isOutOfStock: false,
    createdAt: new Date("2023-03-22"),
    updatedAt: new Date("2023-07-15")
  }
];

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
    title: "Summer Collection 2024",
    subtitle: "Discover the latest trends for the season",
    ctaText: "Shop Now",
    ctaLink: "/category/summer",
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
