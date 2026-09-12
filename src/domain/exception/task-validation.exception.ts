import { DomainException } from './domain.exception'

export class TaskValidationException extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}
