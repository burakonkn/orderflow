import z from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../common/errors/validationError.js";

export function validate(schema: z.ZodType, target: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new ValidationError("Geçersiz istek verisi", result.error.issues),
      );
    }
    if (target === "body") {
      req.body = result.data;
    } else if (target === "query") {
      res.locals.query = result.data;
    }

    next();
  };
}
