import { describe, expect, it, vi } from 'vitest'
import { TaskValidationException } from '../exception/task-validation.exception'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { CreateTaskUseCase } from './create-task.usecase'

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


describe('CreateTaskUseCase', () => {
  it('should create and persist a task with minimal data', async () => {
    const repository = new InMemoryTaskRepository()
    const useCase = new CreateTaskUseCase(repository)

    const result = await useCase.execute({
      title: 'Learn TDD',
    })

    expect(result).toBeInstanceOf(Task)
    expect(result.title).toBe('Learn TDD')
    expect(result.description).toBeNull()
    expect(result.status).toBe(TaskStatus.PENDING)
    expect(repository.tasks).toHaveLength(1)
    expect(repository.tasks[0].id).toBe(result.id)
  })

  it('should create and persist a task with full data', async () => {
    const repository = new InMemoryTaskRepository()
    const useCase = new CreateTaskUseCase(repository)

    const result = await useCase.execute({
      title: 'Workshop',
      description: 'Spec-driven development workshop',
      status: TaskStatus.IN_PROGRESS,
    })

    expect(result).toBeInstanceOf(Task)
    expect(result.title).toBe('Workshop')
    expect(result.description).toBe('Spec-driven development workshop')
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
    expect(repository.tasks).toHaveLength(1)
  })

  it('should not call repository when domain validation fails', async () => {
    const repository = new InMemoryTaskRepository()
    const createSpy = vi.spyOn(repository, 'create')
    const useCase = new CreateTaskUseCase(repository)

    await expect(
      useCase.execute({
        title: 'ab',
      })
    ).rejects.toThrow(TaskValidationException)

    expect(createSpy).not.toHaveBeenCalled()
    expect(repository.tasks).toHaveLength(0)
  })

  it('should propagate repository errors cleanly', async () => {
    const repository = new InMemoryTaskRepository()
    vi.spyOn(repository, 'create').mockRejectedValueOnce(new Error('Database connection failed'))
    const useCase = new CreateTaskUseCase(repository)

    await expect(
      useCase.execute({
        title: 'Valid title',
      })
    ).rejects.toThrow('Database connection failed')
  })
})
