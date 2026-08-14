import { FileRepository } from "./fileRepository.js";
import { OrderSchema, type Order } from "../validation/schemas.js";
import { config } from "../config/config.js";

export const orderRepository = new FileRepository<Order>(
  `${config.dataDir}/orders.json`,
  OrderSchema,
);
