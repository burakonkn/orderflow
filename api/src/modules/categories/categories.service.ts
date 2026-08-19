// Prisma ile veritabanı işlemleri + iş kuralları
import { BusinessRuleError } from "../../common/errors/businessRuleError.js";
import { prisma } from "../../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { CreateCategoryInput } from "./categories.dto.js";

export async function listCategories() {
  return await prisma.category.findMany();
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    return await prisma.category.create({ data: input });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new BusinessRuleError("Bu isim veya slug zaten kullanılıyor.");
    }
    throw error;
  }
}
