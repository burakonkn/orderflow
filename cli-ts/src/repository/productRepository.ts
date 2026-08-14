import { FileRepository } from "./fileRepository.js";
import { ProductSchema, type Product } from "../validation/schemas.js";
import { config } from "../config/config.js";

export const productRepository = new FileRepository<Product>(
  `${config.dataDir}/products.json`,
  ProductSchema,
);
