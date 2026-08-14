import { BusinessRuleError } from "../errors/businessRuleError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";
import type { Customer } from "../validation/schemas.js";

export async function createCustomer(
  input: Omit<Customer, "id" | "createdAt">,
): Promise<Customer> {
  const errors: string[] = [];

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

  const allCustomer = await customerRepository.getAll();
  const index = allCustomer.findIndex((c) => c.email === input.email);
  if (index !== -1) {
    throw new BusinessRuleError("Bu eposta kullanılmakta.");
  }
  const customerData: Omit<Customer, "id"> = {
    ...input,
    createdAt: new Date().toISOString(),
  };
  return await customerRepository.create(customerData);
}

export async function getCustomer(id: number): Promise<Customer> {
  const data = await customerRepository.getById(id);
  if (typeof data === "undefined") {
    throw new NotFoundError(`Customer with id ${id} not found`);
  }
  return data;
}
