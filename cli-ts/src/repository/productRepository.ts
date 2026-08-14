import { FileRepository } from "./fileRepository.js";
import { ProductSchema, type Product } from "../validation/schemas.js";

export const productRepository = new FileRepository<Product>(
  "./data/products.json",
  ProductSchema,
);
