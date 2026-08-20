import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "SHIPPED", "DELIVERED"]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
