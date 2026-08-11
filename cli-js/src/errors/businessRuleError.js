import { AppError } from "./appError.js";

export class BusinessRuleError extends AppError {
  constructor(message, details = null) {
    super(message, details);
    this.code = "BUSINESS_RULE_VIOLATION";
  }
}
