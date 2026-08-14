import { FileRepository } from "./fileRepository.js";
import { CustomerSchema, type Customer } from "../validation/schemas.js";

export const customerRepository = new FileRepository<Customer>(
  "./data/customers.json",
  CustomerSchema,
);
