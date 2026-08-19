// Hangi URL + metot, hangi controller fonksiyonuna gider.

import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { CreateCategorySchema } from "./categories.dto.js";
import { getCategories, postCategory } from "./categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(getCategories));
categoriesRouter.post(
  "/",
  validate(CreateCategorySchema),
  asyncHandler(postCategory),
);
