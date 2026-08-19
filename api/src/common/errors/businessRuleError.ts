import { AppError } from "./appError.js";

export class BusinessRuleError extends AppError {
  constructor(message: string, details: unknown = null) {
    super(message, "BUSINESS_RULE_ERROR", 409, details);
  }
}
