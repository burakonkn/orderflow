import { AppError } from "../errors/appError.js";
import { ValidationError } from "../errors/validationError.js";
import { NotFound } from "../errors/notFoundError.js";
import { productRepository } from "../repository/productRepository.js";

export async function createProduct(input) {
  let errors = [];
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

export async function getProduct(id) {
  const data = await productRepository.getById(id);
  if (typeof data === "undefined") {
    throw new NotFound(`Product with id ${id} not found`);
  }
  return data;
}
