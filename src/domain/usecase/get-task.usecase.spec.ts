import { describe, expect, it } from 'vitest'
import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { GetTaskUseCase } from './get-task.usecase'

class InMemoryTaskRepository implements TaskRepository {
  public tasks: Task[] = []

  async create(task: Task): Promise<Task> {
    this.tasks.push(task)
    return task
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.find((t) => t.id === id)
    return task ?? null
  }
}

describe('GetTaskUseCase', () => {
  it('should return the task when it exists', async () => {
    const repository = new InMemoryTaskRepository()
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Existing Task',
      description: 'Test description',
      status: TaskStatus.IN_PROGRESS,
    })
    await repository.create(task)

    const useCase = new GetTaskUseCase(repository)
    const result = await useCase.execute('123e4567-e89b-42d3-a456-426614174000')

    expect(result).toBeInstanceOf(Task)
    expect(result.id).toBe(task.id)
    expect(result.title).toBe('Existing Task')
    expect(result.description).toBe('Test description')
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should throw TaskNotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository()
    const useCase = new GetTaskUseCase(repository)

    const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(TaskNotFoundException)
    await expect(useCase.execute(nonExistentId)).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
      message: `Task with id '${nonExistentId}' not found`,
    })
  })
})
