export abstract class DomainException extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  readonly details?: unknown

  constructor(message: string, details?: unknown) {
    super(message)
    this.name = this.constructor.name
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
