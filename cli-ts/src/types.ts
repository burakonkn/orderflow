export type Role = "admin" | "user";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface CreateOrderInput {
  customerId: number;
  items: { productId: number; quantity: number }[];
}

export interface SummaryReport {
  totalRevenue: number;
  orderCount: number;
  averageBasket: number;
}

export interface TopProductEntry {
  productId: number;
  name: string;
  totalQuantitySold: number;
}

export interface CityDistributionEntry {
  city: string;
  orderCount: number;
}
