import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors/appError.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }
  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL",
      message: "Sunucu hatası.",
    },
  });
}
