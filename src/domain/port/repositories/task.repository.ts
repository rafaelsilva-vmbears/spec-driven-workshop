import { Task } from '@domain/model/task.model'

export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
}
