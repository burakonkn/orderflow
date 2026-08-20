import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "./orders.dto.js";
import {
  postOrder,
  patchOrderStatus,
  postCancelOrder,
  getOrders,
} from "./orders.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/", asyncHandler(getOrders));

ordersRouter.post("/", validate(CreateOrderSchema), asyncHandler(postOrder));

ordersRouter.patch(
  "/:id/status",
  validate(UpdateOrderStatusSchema),
  asyncHandler(patchOrderStatus),
);

ordersRouter.post("/:id/cancel", asyncHandler(postCancelOrder));
