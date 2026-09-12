import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { ListTasksUseCase } from './list-tasks.usecase'

describe('ListTasksUseCase', () => {
  let useCase: ListTasksUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository

    useCase = new ListTasksUseCase(taskRepository)
  })

  it('should list tasks using default parameters when query is omitted', async () => {
    const mockTask = new Task({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Tarefa de teste',
      description: 'Descrição de teste',
      status: TaskStatus.PENDING,
    })

    const expectedResult = {
      items: [mockTask],
      total: 1,
      page: 0,
      pageSize: 10,
    }

    vi.spyOn(taskRepository, 'findAll').mockResolvedValue(expectedResult)

    const result = await useCase.execute()

    expect(taskRepository.findAll).toHaveBeenCalledWith({
      page: 0,
      pageSize: 10,
    })
    expect(result).toEqual(expectedResult)
  })

  it('should list tasks using custom parameters when provided', async () => {
    const expectedResult = {
      items: [],
      total: 15,
      page: 2,
      pageSize: 5,
    }

    vi.spyOn(taskRepository, 'findAll').mockResolvedValue(expectedResult)

    const result = await useCase.execute({ page: 2, pageSize: 5 })

    expect(taskRepository.findAll).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
    })
    expect(result).toEqual(expectedResult)
  })

  it('should propagate error when repository throws', async () => {
    vi.spyOn(taskRepository, 'findAll').mockRejectedValue(new Error('Database query error'))

    await expect(useCase.execute({ page: 0, pageSize: 10 })).rejects.toThrow('Database query error')
  })
})
