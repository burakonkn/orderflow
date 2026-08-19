import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { CreateProductInput, ProductQuery } from "./products.dto.js";
import { NotFoundError } from "../../common/errors/notFoundError.js";

export async function listProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {};

  if (query.categoryId !== undefined) {
    where.categoryId = query.categoryId;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) {
      where.price.gte = query.minPrice;
    }

    if (query.maxPrice !== undefined) {
      where.price.lte = query.maxPrice;
    }
  }

  return await prisma.product.findMany({
    where,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });

  if (!category) {
    throw new NotFoundError("Kategori bulunamadı.");
  }

  return await prisma.product.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
    },
  });
}
