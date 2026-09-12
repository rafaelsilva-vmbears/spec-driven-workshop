import { describe, expect, it, vi } from 'vitest'
import { TaskNotFoundException } from '../exception/task-not-found.exception'
import { Task } from '../model/task.model'
import { FindAllTasksParams, PaginatedResult, TaskRepository } from '../port/repositories/task.repository'
import { DeleteTaskUseCase } from './delete-task.usecase'

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

  async findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>> {
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

  async delete(id: string): Promise<void> {
    const task = this.tasks.find((t) => t.id === id)
    if (task && !task.isDeleted()) {
      task.delete()
    }
  }
}

describe('DeleteTaskUseCase', () => {
  it('should soft delete active task and persist deletion via repository', async () => {
    const repository = new InMemoryTaskRepository()
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Task to delete',
    })
    await repository.create(task)

    const deleteSpy = vi.spyOn(repository, 'delete')
    const useCase = new DeleteTaskUseCase(repository)

    await useCase.execute(task.id)

    expect(deleteSpy).toHaveBeenCalledWith(task.id)
    expect(task.isDeleted()).toBe(true)
  })

  it('should throw TaskNotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository()
    const useCase = new DeleteTaskUseCase(repository)

    const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(TaskNotFoundException)
    await expect(useCase.execute(nonExistentId)).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
      message: `Task with id '${nonExistentId}' not found`,
    })
  })

  it('should throw TaskNotFoundException when task is already soft-deleted', async () => {
    const repository = new InMemoryTaskRepository()
    const softDeletedTask = new Task({
      id: '123e4567-e89b-42d3-a456-426614174001',
      title: 'Already deleted',
      deletedAt: new Date(),
    })
    repository.tasks.push(softDeletedTask)

    const useCase = new DeleteTaskUseCase(repository)

    await expect(useCase.execute(softDeletedTask.id)).rejects.toThrow(TaskNotFoundException)
  })
})
