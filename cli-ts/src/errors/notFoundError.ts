import { AppError } from "./appError.js";

export class NotFoundError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(message, "NOT_FOUND", details);
  }
}
