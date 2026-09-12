import { DomainException } from './domain.exception'

export class TaskNotFoundException extends DomainException {
  constructor(taskId: string) {
    super(`Task with id ${taskId} was not found`, 'TASK_NOT_FOUND', 404, { taskId })
  }
}
