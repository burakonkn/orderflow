import { AppError } from "./appError.js";

export class NotFoundError extends AppError {
  constructor(message, details = null) {
    super(message, details);
    this.code = "NOT_FOUND";
  }
}
