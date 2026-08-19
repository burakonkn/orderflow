import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import {
  CreateProductInput,
  CreateProductSchema,
  ProductQuerySchema,
} from "./products.dto.js";
import { getProducts, postProduct } from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  validate(ProductQuerySchema, "query"),
  asyncHandler(getProducts),
);

productsRouter.post(
  "/",
  validate(CreateProductSchema),
  asyncHandler(postProduct),
);
