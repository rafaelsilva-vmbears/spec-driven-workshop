import { Injectable } from '@nestjs/common'
import { TaskRepository } from '../port/repositories/task.repository'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

@Injectable()
export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundException(id)
    }

    task.delete()

    await this.taskRepository.delete(id)
  }
}
