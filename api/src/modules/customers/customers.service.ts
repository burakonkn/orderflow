import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { CreateCustomerInput } from "./customers.dto.js";
import { BusinessRuleError } from "../../common/errors/businessRuleError.js";

export async function listCustomers() {
  return await prisma.customer.findMany();
}

export async function createCustomer(input: CreateCustomerInput) {
  try {
    return await prisma.customer.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        city: input.city
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BusinessRuleError("Bu email zaten kullanılıyor.");
    }
    throw error;
  }
}
