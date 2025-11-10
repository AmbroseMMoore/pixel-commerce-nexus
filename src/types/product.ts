
export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subCategories: SubCategory[];
};

export type SubCategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
};

export type SizeVariant = {
  id: string;
  name: string;
  inStock: boolean;
  stockQuantity: number;
  isLowStock: boolean;
  priceOriginal: number;
  priceDiscounted?: number;
};

export type ColorVariant = {
  id: string;
  name: string;
  colorCode: string;
  images: string[];
  sizes: SizeVariant[];
};

export type ProductPrice = {
  original: number;
  discounted?: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: ProductPrice;
  categoryId: string;
  subCategoryId: string;
  colorVariants: ColorVariant[];
  ageRanges: string[];
  specifications?: Record<string, string> | string[];
  isLowStock: boolean;
  isOutOfStock: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CartItem = {
  productId: string;
  title: string;
  price: ProductPrice;
  colorVariant: ColorVariant;
  sizeVariant: SizeVariant;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};
