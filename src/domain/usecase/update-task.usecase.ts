import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'

export interface UpdateTaskCommand {
  title?: string
  description?: string | null
  status?: TaskStatus
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(id)

    if (!task || task.isDeleted()) {
      throw new TaskNotFoundException(id)
    }

    const hasChanges = task.update(command)

    if (!hasChanges) {
      return task
    }

    return this.taskRepository.update(task)
  }
}
