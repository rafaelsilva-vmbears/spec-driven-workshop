import { describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '@domain/model/task.model'
import { DrizzleDB } from '../database/drizzle/drizzle.module'
import { DrizzleTaskRepository } from './drizzle-task.repository'

describe('DrizzleTaskRepository', () => {
  it('should insert and return a Task domain model', async () => {
    const mockReturnedRow = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Database task',
      description: 'Persisted in Postgres',
      status: 'IN_PROGRESS',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    }

    const mockReturning = vi.fn().mockResolvedValue([mockReturnedRow])
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockInsert = vi.fn().mockReturnValue({ values: mockValues })

    const mockDb = {
      insert: mockInsert,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)

    const taskToCreate = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Database task',
      description: 'Persisted in Postgres',
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    })

    const result = await repository.create(taskToCreate)

    expect(mockInsert).toHaveBeenCalledOnce()
    expect(mockValues).toHaveBeenCalledWith({
      id: taskToCreate.id,
      title: taskToCreate.title,
      description: taskToCreate.description,
      status: taskToCreate.status,
      createdAt: taskToCreate.createdAt,
      updatedAt: taskToCreate.updatedAt,
      deletedAt: taskToCreate.deletedAt,
    })
    expect(result).toBeInstanceOf(Task)
    expect(result.id).toBe(mockReturnedRow.id)
    expect(result.title).toBe(mockReturnedRow.title)
    expect(result.description).toBe(mockReturnedRow.description)
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should find active task by id and return Task domain model', async () => {
    const mockReturnedRow = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Active Task',
      description: 'Active task description',
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    }

    const mockWhere = vi.fn().mockResolvedValue([mockReturnedRow])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

    const mockDb = {
      select: mockSelect,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)
    const result = await repository.findById('123e4567-e89b-42d3-a456-426614174000')

    expect(mockSelect).toHaveBeenCalledOnce()
    expect(mockFrom).toHaveBeenCalledOnce()
    expect(mockWhere).toHaveBeenCalledOnce()
    expect(result).toBeInstanceOf(Task)
    expect(result?.id).toBe(mockReturnedRow.id)
    expect(result?.title).toBe(mockReturnedRow.title)
    expect(result?.description).toBe(mockReturnedRow.description)
    expect(result?.status).toBe(TaskStatus.PENDING)
  })

  it('should return null when task is not found', async () => {
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })

    const mockDb = {
      select: mockSelect,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)
    const result = await repository.findById('123e4567-e89b-42d3-a456-426614174999')

    expect(mockSelect).toHaveBeenCalledOnce()
    expect(mockFrom).toHaveBeenCalledOnce()
    expect(mockWhere).toHaveBeenCalledOnce()
    expect(result).toBeNull()
  })

  it('should find all active tasks with pagination and return PaginatedResult', async () => {
    const mockReturnedRow = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Active Task',
      description: 'Active task description',
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    }

    const mockCountWhere = vi.fn().mockResolvedValue([{ total: 10 }])
    const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere })

    const mockOffset = vi.fn().mockResolvedValue([mockReturnedRow])
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockItemsWhere = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockItemsFrom = vi.fn().mockReturnValue({ where: mockItemsWhere })

    const mockSelect = vi.fn().mockImplementation((arg) => {
      if (arg && arg.total) {
        return { from: mockCountFrom }
      }
      return { from: mockItemsFrom }
    })

    const mockDb = {
      select: mockSelect,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)
    const result = await repository.findAll({ page: 1, pageSize: 2 })

    expect(mockSelect).toHaveBeenCalledTimes(2)
    expect(mockLimit).toHaveBeenCalledWith(2)
    expect(mockOffset).toHaveBeenCalledWith(2)
    expect(result.total).toBe(10)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(2)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toBeInstanceOf(Task)
    expect(result.items[0].id).toBe(mockReturnedRow.id)
  })

  it('should default total to 0 if count query returns empty array', async () => {
    const mockCountWhere = vi.fn().mockResolvedValue([])
    const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere })

    const mockOffset = vi.fn().mockResolvedValue([])
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockItemsWhere = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockItemsFrom = vi.fn().mockReturnValue({ where: mockItemsWhere })

    const mockSelect = vi.fn().mockImplementation((arg) => {
      if (arg && arg.total) {
        return { from: mockCountFrom }
      }
      return { from: mockItemsFrom }
    })

    const mockDb = {
      select: mockSelect,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)
    const result = await repository.findAll({ page: 0, pageSize: 10 })

    expect(result.total).toBe(0)
    expect(result.items).toEqual([])
  })

  it('should update and return a Task domain model', async () => {
    const mockReturnedRow = {
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Updated Database task',
      description: 'Updated description',
      status: 'DONE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      deletedAt: null,
    }

    const mockReturning = vi.fn().mockResolvedValue([mockReturnedRow])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })

    const mockDb = {
      update: mockUpdate,
    } as unknown as DrizzleDB

    const repository = new DrizzleTaskRepository(mockDb)

    const taskToUpdate = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Updated Database task',
      description: 'Updated description',
      status: TaskStatus.DONE,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      deletedAt: null,
    })

    const result = await repository.update(taskToUpdate)

    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockSet).toHaveBeenCalledWith({
      title: taskToUpdate.title,
      description: taskToUpdate.description,
      status: taskToUpdate.status,
      updatedAt: taskToUpdate.updatedAt,
    })
    expect(result).toBeInstanceOf(Task)
    expect(result.id).toBe(mockReturnedRow.id)
    expect(result.title).toBe(mockReturnedRow.title)
    expect(result.description).toBe(mockReturnedRow.description)
    expect(result.status).toBe(TaskStatus.DONE)
  })
})
