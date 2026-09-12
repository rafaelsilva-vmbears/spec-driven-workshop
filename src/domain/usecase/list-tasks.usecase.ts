import { Task } from '../model/task.model'
import { FindAllTasksParams, PaginatedResult, TaskRepository } from '../port/repositories/task.repository'

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(params: FindAllTasksParams): Promise<PaginatedResult<Task>> {
    return this.taskRepository.findAll(params)
  }
}
