import { Task } from '@domain/model/task.model'

export interface FindAllTasksParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
  abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>
  abstract update(task: Task): Promise<Task>
}
