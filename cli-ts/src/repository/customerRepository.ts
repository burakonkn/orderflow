import { FileRepository } from "./fileRepository.js";
import { CustomerSchema, type Customer } from "../validation/schemas.js";
import { config } from "../config/config.js";

export const customerRepository = new FileRepository<Customer>(
  `${config.dataDir}/products.json`,
  CustomerSchema,
);
