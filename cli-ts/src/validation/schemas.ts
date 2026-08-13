import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.email(),
  city: z.string().min(1),
  createdAt: z.string(),
});

export const OrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  customerId: z.number().int().positive(),
  items: z.array(OrderItemSchema),
  total: z.number().positive(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  createdAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
