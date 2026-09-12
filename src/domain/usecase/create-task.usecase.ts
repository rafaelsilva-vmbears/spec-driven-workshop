import { Injectable } from '@nestjs/common'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'

export interface CreateTaskCommand {
  title: string
  description?: string | null
  status?: TaskStatus
}

@Injectable()
export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const task = Task.create({
      title: command.title,
      description: command.description,
      status: command.status,
    })

    return this.taskRepository.create(task)
  }
}
