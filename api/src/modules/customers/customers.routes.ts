import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../common/asyncHandler.js";
import { CreateCustomerSchema } from "./customers.dto.js";
import { getCustomers, postCustomer } from "./customers.controller.js";

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(getCustomers));
customersRouter.post(
  "/",
  validate(CreateCustomerSchema),
  asyncHandler(postCustomer),
);
