import { FileRepository } from "./fileRepository.js";
import { OrderSchema, type Order } from "../validation/schemas.js";

export const orderRepository = new FileRepository<Order>(
  "./data/orders.json",
  OrderSchema,
);
