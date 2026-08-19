export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
