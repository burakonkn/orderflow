import { BusinessRuleError } from "../errors/businessRuleError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { ValidationError } from "../errors/validationError.js";
import { customerRepository } from "../repository/customerRepository.js";
import { orderRepository } from "../repository/orderRepository.js";
import { productRepository } from "../repository/productRepository.js";

export async function createOrder(input) {
  const errors = [];
  const problems = [];
  const resolvedItems = [];

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

    const newStock = product.stock - item.quantity;
    await productRepository.update(item.productId, { stock: newStock });
  }

  const order = {
    customerId: input.customerId,
    items: resolvedItems,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return await orderRepository.create(order);
}

const STATUSES = ["pending", "confirmed", "shipped", "delivered"];

export async function updateOrderStatus(id, newStatus) {
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

  return await orderRepository.update(id, { status: newStatus });
}

export async function cancelOrder(id) {
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
    const product = await productRepository.getById(item.productId);

    const newStock = product.stock + item.quantity;
    await productRepository.update(item.productId, { stock: newStock });
  }
  return await orderRepository.update(id, { status: "cancelled" });
}
