import { AppError } from "./appError.js";

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, details);
    this.code = "VALIDATION_ERROR";
  }
}
