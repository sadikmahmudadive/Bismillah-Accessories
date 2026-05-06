import type { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "admin";

export type AppUserProfile = {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  phone?: string;
  addresses?: string[]; // Simplified: just an array of address strings for now
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProductStatus = "draft" | "active" | "archived";

export type ProductVariant = {
  id: string;
  name: string;
  price?: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  gallery?: string[];
  cloudinaryPublicId?: string;
  tags: string[];
  status: ProductStatus;
  averageRating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
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
  gallery?: string[];
  cloudinaryPublicId?: string;
  tags: string[];
  status: ProductStatus;
  variants?: ProductVariant[];
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
  variantId?: string;
  variantName?: string;
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
  promoCode?: string;
  discountAmount?: number;
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
  variantId?: string;
  variantName?: string;
};

export type Cart = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  lastUpdated: number;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
  createdAt: Timestamp | string | Date;
};

export type PromoCodeType = "percentage" | "fixed";

export type PromoCode = {
  id: string;
  code: string; // e.g. "SAVE10"
  type: PromoCodeType;
  value: number; // e.g. 10 (%) or 100 (৳)
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: Timestamp;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type OfferBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
};
