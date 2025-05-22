
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
};

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
};

export type OrderItem = {
  productId: string;
  title: string;
  price: number;
  colorVariant: string;
  colorCode: string;
  sizeVariant: string;
  quantity: number;
};

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}
