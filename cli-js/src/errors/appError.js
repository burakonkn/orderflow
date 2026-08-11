export class AppError extends Error {
  constructor(message, details = null) {
    super(message);
    this.details = details;
    this.name = this.constructor.name;
  }
}
