import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { CreateOrderInput, UpdateOrderStatusInput } from "./orders.dto.js";
import { NotFoundError } from "../../common/errors/notFoundError.js";
import { BusinessRuleError } from "../../common/errors/businessRuleError.js";

export async function listOrders() {
  return await prisma.order.findMany({ include: { orderItems: true } });
}

export async function createOrder(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Müşteri bulunamadı.");
    }

    const resolvedItems: {
      productId: number;
      quantity: number;
      unitPrice: Prisma.Decimal;
    }[] = [];

    for (const item of input.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }

      const updateResult = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (updateResult.count === 0) {
        throw new BusinessRuleError(
          `Insufficient stock for product ${item.productId}`,
        );
      }

      resolvedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const total = resolvedItems.reduce(
      (sum, item) => (sum += item.quantity * Number(item.unitPrice)),
      0,
    );

    const createdOrder = await tx.order.create({
      data: {
        customerId: input.customerId,
        total: total,
        orderItems: { create: resolvedItems },
      },
      include: { orderItems: true },
    });

    return createdOrder;
  });
}

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export async function updateOrderStatus(
  id: number,
  input: UpdateOrderStatusInput,
) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    throw new NotFoundError("Sipariş bulunamadı.");
  }

  const currentIndex = STATUSES.indexOf(order.status);
  const newIndex = STATUSES.indexOf(input.status);

  if (!(newIndex > currentIndex)) {
    throw new BusinessRuleError(
      `Cannot move from ${order.status} to ${input.status}`,
    );
  }

  return prisma.order.update({ where: { id }, data: { status: input.status } });
}

export async function cancelOrder(id: number) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundError("Sipariş bulunamadı.");
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new BusinessRuleError("Sipariş iptal edilemez.");
    }

    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    return await tx.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  });
}
