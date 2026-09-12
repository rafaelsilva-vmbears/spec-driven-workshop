import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { Task } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundException(id)
    }

    return task
  }
}
