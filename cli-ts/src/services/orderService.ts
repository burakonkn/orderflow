import { BusinessRuleError } from "../errors/businessRuleError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";
import { orderRepository } from "../repository/orderRepository.js";
import { productRepository } from "../repository/productRepository.js";
import type { CreateOrderInput, OrderStatus } from "../types.js";
import type { Order, OrderItem } from "../validation/schemas.js";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const errors: string[] = [];
  const problems: string[] = [];
  const resolvedItems: OrderItem[] = [];

  if (typeof input.customerId !== "number" || input.customerId <= 0) {
    errors.push("customerId is a not number.");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    errors.push("items not Array or Length 0");
  } else if (!input.items.every((i) => i.productId && i.quantity)) {
    errors.push("items not include productId and quantity");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid order data:", errors);
  }

  const customer = await customerRepository.getById(input.customerId);
  if (typeof customer === "undefined") {
    problems.push("Invalid customerId");
  }

  const products = await Promise.all(
    input.items.map((item) => productRepository.getById(item.productId)),
  );

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const item = input.items[i];

    if (typeof item === "undefined") {
      throw new NotFoundError(`Order with item ${item} not found`);
    }

    if (typeof product === "undefined") {
      problems.push(`Product ${item.productId} not found`);
    } else if (product.stock < item.quantity) {
      problems.push(
        `insufficient stock for product ${item.productId}. Stock: ${product.stock}, Requested: ${item.quantity}`,
      );
    } else {
      resolvedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }
  }

  if (problems.length > 0) {
    throw new BusinessRuleError("Cannot create order", problems);
  }

  const total = resolvedItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  for (let i = 0; i < resolvedItems.length; i++) {
    const item = resolvedItems[i];
    const product = products[i];

    if (typeof product === "undefined") {
      throw new NotFoundError(`Order with product ${product} not found`);
    }

    if (typeof item === "undefined") {
      throw new NotFoundError(`Order with item ${item} not found`);
    }

    const newStock = product.stock - item.quantity;
    await productRepository.update(item.productId, { stock: newStock });
  }

  const order: Omit<Order, "id"> = {
    customerId: input.customerId,
    items: resolvedItems,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return await orderRepository.create(order);
}

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];

export async function updateOrderStatus(
  id: number,
  newStatus: OrderStatus,
): Promise<Order> {
  const order = await orderRepository.getById(id);
  if (!order) {
    throw new NotFoundError("Order not found.");
  }
  const currentIndex = STATUSES.indexOf(order.status);
  const newIndex = STATUSES.indexOf(newStatus);
  if (!(newIndex > currentIndex)) {
    throw new BusinessRuleError(
      `Cannot move from ${order.status} to ${newStatus}`,
    );
  }

  const updated = await orderRepository.update(id, { status: newStatus });

  if (!updated) {
    throw new NotFoundError("Order not found.");
  }

  return updated;
}

export async function cancelOrder(id: number): Promise<Order> {
  const order = await orderRepository.getById(id);
  if (!order) {
    throw new NotFoundError("Order not found.");
  }
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new BusinessRuleError(
      "Only pending or confirmed orders can be cancelled.",
    );
  }

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];

    if (typeof item === "undefined") {
      throw new NotFoundError("Order item not found.");
    }
    const product = await productRepository.getById(item.productId);

    if (typeof product === "undefined") {
      throw new NotFoundError("Order product not found");
    }

    const newStock = product.stock + item.quantity;
    await productRepository.update(item.productId, { stock: newStock });
  }

  const cancelled = await orderRepository.update(id, { status: "cancelled" });

  if (!cancelled) {
    throw new NotFoundError("Order not found.");
  }

  return cancelled;
}
