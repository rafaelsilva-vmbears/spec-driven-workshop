import { describe, expect, it } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { FindAllTasksParams, PaginatedResult, TaskRepository } from '../port/repositories/task.repository'
import { ListTasksUseCase } from './list-tasks.usecase'

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
    const activeTasks = this.tasks.filter((t) => t.deletedAt === null)
    const offset = params.page * params.pageSize
    const items = activeTasks.slice(offset, offset + params.pageSize)

    return {
      items,
      total: activeTasks.length,
      page: params.page,
      pageSize: params.pageSize,
    }
  }
}

describe('ListTasksUseCase', () => {
  it('should return paginated tasks from repository', async () => {
    const repository = new InMemoryTaskRepository()
    const task1 = new Task({
      id: '123e4567-e89b-42d3-a456-426614174001',
      title: 'Task 1',
      description: 'First task',
      status: TaskStatus.PENDING,
    })
    const task2 = new Task({
      id: '123e4567-e89b-42d3-a456-426614174002',
      title: 'Task 2',
      description: 'Second task',
      status: TaskStatus.IN_PROGRESS,
    })
    await repository.create(task1)
    await repository.create(task2)

    const useCase = new ListTasksUseCase(repository)
    const result = await useCase.execute({ page: 0, pageSize: 10 })

    expect(result.items).toHaveLength(2)
    expect(result.items[0].id).toBe(task1.id)
    expect(result.items[1].id).toBe(task2.id)
    expect(result.total).toBe(2)
    expect(result.page).toBe(0)
    expect(result.pageSize).toBe(10)
  })

  it('should forward custom page and pageSize parameters correctly', async () => {
    const repository = new InMemoryTaskRepository()
    for (let i = 1; i <= 5; i++) {
      await repository.create(
        new Task({
          id: `123e4567-e89b-42d3-a456-42661417400${i}`,
          title: `Task ${i}`,
          description: `Description ${i}`,
          status: TaskStatus.PENDING,
        })
      )
    }

    const useCase = new ListTasksUseCase(repository)
    const result = await useCase.execute({ page: 1, pageSize: 2 })

    expect(result.items).toHaveLength(2)
    expect(result.items[0].title).toBe('Task 3')
    expect(result.items[1].title).toBe('Task 4')
    expect(result.total).toBe(5)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(2)
  })
})
