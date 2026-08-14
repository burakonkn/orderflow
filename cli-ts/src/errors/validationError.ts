import { AppError } from "./appError.js";

export class ValidationError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(message, "VALIDATION_ERROR", details);
  }
}
