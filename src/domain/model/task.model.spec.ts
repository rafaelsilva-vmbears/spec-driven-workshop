import { describe, expect, it } from 'vitest'
import { TaskValidationException } from '../exception/task-validation.exception'
import { Task, TaskStatus } from './task.model'

describe('Task Domain Model', () => {
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  describe('creation & invariants', () => {
    it('should create a valid task with minimal properties and defaults', () => {
      const before = new Date()
      const task = new Task({ title: 'Build feature' })
      const after = new Date()

      expect(task.id).toMatch(UUID_V4_REGEX)
      expect(task.title).toBe('Build feature')
      expect(task.description).toBeNull()
      expect(task.status).toBe(TaskStatus.PENDING)
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(task.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(task.updatedAt).toBeInstanceOf(Date)
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(task.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(task.deletedAt).toBeNull()
      expect(task.isDeleted()).toBe(false)
    })

    it('should create a valid task with all properties provided', () => {
      const id = '123e4567-e89b-42d3-a456-426614174000'
      const createdAt = new Date('2026-01-01T00:00:00Z')
      const updatedAt = new Date('2026-01-02T00:00:00Z')

      const task = new Task({
        id,
        title: 'Complete workshop',
        description: 'Writing unit tests and integration tests',
        status: TaskStatus.IN_PROGRESS,
        createdAt,
        updatedAt,
        deletedAt: null,
      })

      expect(task.id).toBe(id)
      expect(task.title).toBe('Complete workshop')
      expect(task.description).toBe('Writing unit tests and integration tests')
      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
      expect(task.createdAt).toBe(createdAt)
      expect(task.updatedAt).toBe(updatedAt)
      expect(task.deletedAt).toBeNull()
      expect(task.isDeleted()).toBe(false)
    })

    it('should allow DONE status', () => {
      const task = new Task({
        title: 'Finished task',
        status: TaskStatus.DONE,
      })

      expect(task.status).toBe(TaskStatus.DONE)
    })

    it('should allow null description', () => {
      const task = new Task({
        title: 'Task with null description',
        description: null,
      })

      expect(task.description).toBeNull()
    })

    it('should allow boundary title of 3 characters', () => {
      const task = new Task({ title: 'abc' })
      expect(task.title).toBe('abc')
    })

    it('should allow boundary title of 100 characters', () => {
      const title100 = 'a'.repeat(100)
      const task = new Task({ title: title100 })
      expect(task.title).toBe(title100)
    })

    it('should allow boundary description of 2000 characters', () => {
      const desc2000 = 'd'.repeat(2000)
      const task = new Task({ title: 'Task with long description', description: desc2000 })
      expect(task.description).toBe(desc2000)
    })
  })

  describe('validation failures', () => {
    it('should throw TaskValidationException when title is missing or undefined', () => {
      expect(() => new Task({ title: undefined as unknown as string })).toThrow(TaskValidationException)
      expect(() => new Task({ title: undefined as unknown as string })).toThrow('Title is required')
    })

    it('should throw TaskValidationException when title is not a string', () => {
      expect(() => new Task({ title: 123 as unknown as string })).toThrow(TaskValidationException)
      expect(() => new Task({ title: 123 as unknown as string })).toThrow('Title must be a string')
    })

    it('should throw TaskValidationException when title is empty or whitespace only', () => {
      expect(() => new Task({ title: '' })).toThrow(TaskValidationException)
      expect(() => new Task({ title: '   ' })).toThrow(TaskValidationException)
      expect(() => new Task({ title: '   ' })).toThrow('Title cannot be empty')
    })

    it('should throw TaskValidationException when title is shorter than 3 characters', () => {
      expect(() => new Task({ title: 'ab' })).toThrow(TaskValidationException)
      expect(() => new Task({ title: 'ab' })).toThrow('Title must be between 3 and 100 characters')
    })

    it('should throw TaskValidationException when title is longer than 100 characters', () => {
      const title101 = 'a'.repeat(101)
      expect(() => new Task({ title: title101 })).toThrow(TaskValidationException)
      expect(() => new Task({ title: title101 })).toThrow('Title must be between 3 and 100 characters')
    })

    it('should throw TaskValidationException when description is not a string', () => {
      expect(() => new Task({ title: 'Valid title', description: 12345 as unknown as string })).toThrow(
        TaskValidationException
      )
      expect(() => new Task({ title: 'Valid title', description: 12345 as unknown as string })).toThrow(
        'Description must be a string'
      )
    })

    it('should throw TaskValidationException when description exceeds 2000 characters', () => {
      const desc2001 = 'a'.repeat(2001)
      expect(() => new Task({ title: 'Valid title', description: desc2001 })).toThrow(TaskValidationException)
      expect(() => new Task({ title: 'Valid title', description: desc2001 })).toThrow(
        'Description cannot exceed 2000 characters'
      )
    })

    it('should throw TaskValidationException when status is invalid', () => {
      expect(() => new Task({ title: 'Valid title', status: 'INVALID_STATUS' as unknown as TaskStatus })).toThrow(
        TaskValidationException
      )
      expect(() => new Task({ title: 'Valid title', status: 'INVALID_STATUS' as unknown as TaskStatus })).toThrow(
        'Invalid status. Allowed values: PENDING, IN_PROGRESS, DONE'
      )
    })

    it('should throw TaskValidationException when id is provided but not a valid UUID', () => {
      expect(() => new Task({ id: 'invalid-id', title: 'Valid title' })).toThrow(TaskValidationException)
      expect(() => new Task({ id: 'invalid-id', title: 'Valid title' })).toThrow('Invalid id format')
    })
  })

  describe('soft delete behavior (ADR 0002)', () => {
    it('should mark task as deleted with timestamp', () => {
      const task = new Task({ title: 'Active task' })
      const before = new Date()
      task.delete()
      const after = new Date()

      expect(task.isDeleted()).toBe(true)
      expect(task.deletedAt).toBeInstanceOf(Date)
      expect(task.deletedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(task.deletedAt!.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('should throw TaskValidationException when attempting to delete an already deleted task', () => {
      const task = new Task({ title: 'Active task' })
      task.delete()

      expect(() => task.delete()).toThrow(TaskValidationException)
      expect(() => task.delete()).toThrow('Task is already deleted')
    })

    it('should correctly report isDeleted when initialized with deletedAt', () => {
      const deletedAt = new Date('2026-01-01T12:00:00Z')
      const task = new Task({
        title: 'Deleted task',
        deletedAt,
      })

      expect(task.isDeleted()).toBe(true)
      expect(task.deletedAt).toBe(deletedAt)
    })
  })
})
