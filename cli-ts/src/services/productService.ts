import { NotFoundError } from "../errors/notFoundError.js";
import { ValidationError } from "../errors/validationError.js";
import { productRepository } from "../repository/productRepository.js";
import type { Product } from "../validation/schemas.js";

export async function createProduct(
  input: Omit<Product, "id">,
): Promise<Product> {
  const errors: string[] = [];

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("name is required.");
  }

  if (typeof input.price !== "number" || input.price <= 0) {
    errors.push("price must be a non-negative number");
  }

  if (typeof input.stock !== "number" || input.stock < 0) {
    errors.push("stock must be a non-negative number");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid product data", errors);
  }

  return await productRepository.create(input);
}

export async function getProduct(id: number): Promise<Product> {
  const data = await productRepository.getById(id);
  if (typeof data === "undefined") {
    throw new NotFoundError(`Product with id ${id} not found`);
  }
  return data;
}
