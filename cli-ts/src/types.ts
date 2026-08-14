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
