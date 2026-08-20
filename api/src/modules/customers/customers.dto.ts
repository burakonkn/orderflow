import { z } from "zod";

export const CreateCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  phone: z.string().optional(),
  city: z.string().min(1),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
