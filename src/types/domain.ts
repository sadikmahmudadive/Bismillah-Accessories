import type { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "admin";

export type AppUserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProductStatus = "draft" | "active" | "archived";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  tags: string[];
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProductInput = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  tags: string[];
  status: ProductStatus;
};

export type PaymentMethod = "cash_on_delivery" | "bkash_mock";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  bkashTransactionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  category: string;
};

export type Cart = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  lastUpdated: number;
};
