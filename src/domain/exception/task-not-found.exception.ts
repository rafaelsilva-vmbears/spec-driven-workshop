import { DomainException } from './domain.exception'

export class TaskNotFoundException extends DomainException {
  readonly code = 'TASK_NOT_FOUND'
  readonly statusCode = 404

  constructor(id: string) {
    super(`Task with id '${id}' not found`)
  }
}
