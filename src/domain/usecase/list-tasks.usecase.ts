import { Injectable } from '@nestjs/common'
import { Task } from '../model/task.model'
import { PaginatedResult, TaskRepository } from '../port/repositories/task.repository'

export interface ListTasksQuery {
  page?: number
  pageSize?: number
}

@Injectable()
export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query?: ListTasksQuery): Promise<PaginatedResult<Task>> {
    const page = query?.page ?? 0
    const pageSize = query?.pageSize ?? 10

    return this.taskRepository.findAll({
      page,
      pageSize,
    })
  }
}
