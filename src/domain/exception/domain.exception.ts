export abstract class DomainException extends Error {
  public readonly errorCode: string
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(message: string, errorCode: string, statusCode = 400, details?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
