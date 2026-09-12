import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { TaskRepository } from '../port/repositories/task.repository'

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id)

    if (!task || task.isDeleted()) {
      throw new TaskNotFoundException(id)
    }

    task.delete()
    await this.taskRepository.delete(id)
  }
}
