import { Injectable } from '@nestjs/common'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

export interface UpdateTaskCommand {
  id: string
  title?: string
  description?: string | null
  status?: TaskStatus
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(command.id)

    if (!task) {
      throw new TaskNotFoundException(command.id)
    }

    const hasChanged = task.update({
      title: command.title,
      description: command.description,
      status: command.status,
    })

    if (!hasChanged) {
      return task
    }

    return this.taskRepository.update(task)
  }
}
