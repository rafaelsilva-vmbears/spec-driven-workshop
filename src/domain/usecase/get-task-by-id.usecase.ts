import { Injectable } from '@nestjs/common'
import { Task } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

@Injectable()
export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new TaskNotFoundException(id)
    }

    return task
  }
}
