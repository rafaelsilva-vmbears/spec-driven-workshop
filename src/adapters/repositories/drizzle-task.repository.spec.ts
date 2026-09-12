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
})
