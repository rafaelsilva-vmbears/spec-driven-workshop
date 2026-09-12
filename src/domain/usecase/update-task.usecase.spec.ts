import { describe, expect, it, vi } from 'vitest'
import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { TaskValidationException } from '../exception/task-validation.exception'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { UpdateTaskUseCase } from './update-task.usecase'

class InMemoryTaskRepository implements TaskRepository {
  public tasks: Task[] = []

  async create(task: Task): Promise<Task> {
    this.tasks.push(task)
    return task
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.find((t) => t.id === id && t.deletedAt === null)
    return task ?? null
  }

  async findAll(params: { page: number; pageSize: number }) {
    const active = this.tasks.filter((t) => t.deletedAt === null)
    const offset = params.page * params.pageSize
    return {
      items: active.slice(offset, offset + params.pageSize),
      total: active.length,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  async update(task: Task): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      this.tasks[index] = task
    }
    return task
  }
}

describe('UpdateTaskUseCase', () => {
  it('should throw TaskNotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository()
    const useCase = new UpdateTaskUseCase(repository)

    const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

    await expect(useCase.execute(nonExistentId, { title: 'New title' })).rejects.toThrow(TaskNotFoundException)
    await expect(useCase.execute(nonExistentId, { title: 'New title' })).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
      message: `Task with id '${nonExistentId}' not found`,
    })
  })

  it('should throw TaskNotFoundException when task is soft-deleted', async () => {
    const repository = new InMemoryTaskRepository()
    const deletedTask = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Deleted Task',
      deletedAt: new Date(),
    })
    repository.tasks.push(deletedTask)

    const useCase = new UpdateTaskUseCase(repository)

    await expect(useCase.execute(deletedTask.id, { title: 'New title' })).rejects.toThrow(TaskNotFoundException)
  })

  it('should update task and persist changes via repository', async () => {
    const repository = new InMemoryTaskRepository()
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Original Title',
      description: 'Original Description',
      status: TaskStatus.PENDING,
    })
    await repository.create(task)

    const updateSpy = vi.spyOn(repository, 'update')
    const useCase = new UpdateTaskUseCase(repository)

    const result = await useCase.execute(task.id, {
      title: 'Updated Title',
      description: null,
      status: TaskStatus.IN_PROGRESS,
    })

    expect(updateSpy).toHaveBeenCalledOnce()
    expect(result.id).toBe(task.id)
    expect(result.title).toBe('Updated Title')
    expect(result.description).toBeNull()
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should not call repository update when no fields changed (no-op optimization)', async () => {
    const repository = new InMemoryTaskRepository()
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Unchanged Title',
      description: 'Unchanged Description',
      status: TaskStatus.PENDING,
    })
    await repository.create(task)

    const updateSpy = vi.spyOn(repository, 'update')
    const useCase = new UpdateTaskUseCase(repository)

    const result = await useCase.execute(task.id, {
      title: 'Unchanged Title',
      description: 'Unchanged Description',
      status: TaskStatus.PENDING,
    })

    expect(updateSpy).not.toHaveBeenCalled()
    expect(result.id).toBe(task.id)
    expect(result.title).toBe('Unchanged Title')

    const emptyResult = await useCase.execute(task.id, {})
    expect(updateSpy).not.toHaveBeenCalled()
    expect(emptyResult.id).toBe(task.id)
  })

  it('should throw TaskValidationException when payload violates domain invariants', async () => {
    const repository = new InMemoryTaskRepository()
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Valid Title',
    })
    await repository.create(task)

    const useCase = new UpdateTaskUseCase(repository)

    await expect(useCase.execute(task.id, { title: 'ab' })).rejects.toThrow(TaskValidationException)
    await expect(useCase.execute(task.id, { title: 'ab' })).rejects.toThrow(
      'Title must be between 3 and 100 characters'
    )
  })
})
