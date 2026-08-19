import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.number().int().positive(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const ProductQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;
