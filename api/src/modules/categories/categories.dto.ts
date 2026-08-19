// Zod şemaları + z.infer ile tipler

import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
