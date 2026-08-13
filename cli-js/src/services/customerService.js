import { BusinessRuleError } from "../errors/businessRuleError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";

export async function createCustomer(input) {
  let errors = [];
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("name is required");
  }

  if (typeof input.email !== "string" || input.email.trim().length === 0) {
    errors.push("email is required");
  }

  if (typeof input.city !== "string" || input.city.trim().length === 0) {
    errors.push("city is required");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid customer data:", errors);
  }

  const all = await customerRepository.getAll();
  const index = all.findIndex((c) => c.email === input.email);
  if (index !== -1) {
    throw new BusinessRuleError("Bu eposta kullanılmakta.");
  }
  input.createdAt = new Date().toISOString();
  return await customerRepository.create(input);
}

export async function getCustomer(id) {
  const data = await customerRepository.getById(id);
  if (typeof data === "undefined") {
    throw new NotFoundError(`Customer with id ${id} not found`);
  }
  return data;
}
