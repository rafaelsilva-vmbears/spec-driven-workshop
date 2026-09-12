import { DomainException } from './domain.exception'

export class TaskValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400

  constructor(message: string, details?: unknown) {
    super(message, details)
  }
}
