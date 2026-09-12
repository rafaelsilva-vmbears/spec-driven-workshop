import { describe, expect, it } from 'vitest'
import { Task, TaskStatus } from './task.model'
import { TaskValidationException } from '../exception/task-validation.exception'

describe('Task Model', () => {
  describe('creation with valid data', () => {
    it('should create a valid task with default PENDING status and generated UUID', () => {
      const task = Task.create({
        title: 'Comprar mantimentos',
      })

      expect(task.id).toBeDefined()
      expect(task.title).toBe('Comprar mantimentos')
      expect(task.description).toBeNull()
      expect(task.status).toBe(TaskStatus.PENDING)
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
      expect(task.deletedAt).toBeNull()
    })

    it('should create a valid task with explicit status and optional description', () => {
      const task = Task.create({
        title: 'Finalizar relatório',
        description: 'Relatório financeiro do Q3',
        status: TaskStatus.IN_PROGRESS,
      })

      expect(task.title).toBe('Finalizar relatório')
      expect(task.description).toBe('Relatório financeiro do Q3')
      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
    })

    it('should trim title and description whitespace', () => {
      const task = Task.create({
        title: '   Revisar PR   ',
        description: '   Descrição detalhada   ',
      })

      expect(task.title).toBe('Revisar PR')
      expect(task.description).toBe('Descrição detalhada')
    })

    it('should reconstruct existing task with all provided properties', () => {
      const fixedDate = new Date('2026-01-01T10:00:00Z')
      const task = new Task({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Tarefa existente',
        description: 'Descrição existente',
        status: TaskStatus.DONE,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        deletedAt: null,
      })

      expect(task.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(task.title).toBe('Tarefa existente')
      expect(task.description).toBe('Descrição existente')
      expect(task.status).toBe(TaskStatus.DONE)
      expect(task.createdAt).toBe(fixedDate)
      expect(task.updatedAt).toBe(fixedDate)
      expect(task.deletedAt).toBeNull()
    })
  })

  describe('invariants validation', () => {
    it('should throw TaskValidationException when title is less than 3 characters', () => {
      expect(() =>
        Task.create({
          title: 'AB',
        })
      ).toThrow(TaskValidationException)

      try {
        Task.create({ title: '  a  ' })
      } catch (error) {
        expect(error).toBeInstanceOf(TaskValidationException)
        const valErr = error as TaskValidationException
        expect(valErr.errorCode).toBe('VALIDATION_ERROR')
        expect(valErr.statusCode).toBe(400)
        expect(valErr.message).toBe('Title must be between 3 and 100 characters')
      }
    })

    it('should throw TaskValidationException when title exceeds 100 characters', () => {
      const longTitle = 'a'.repeat(101)

      expect(() =>
        Task.create({
          title: longTitle,
        })
      ).toThrow(TaskValidationException)
    })

    it('should throw TaskValidationException when description exceeds 2000 characters', () => {
      const longDescription = 'd'.repeat(2001)

      expect(() =>
        Task.create({
          title: 'Título válido',
          description: longDescription,
        })
      ).toThrow(TaskValidationException)

      try {
        Task.create({
          title: 'Título válido',
          description: longDescription,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(TaskValidationException)
        const valErr = error as TaskValidationException
        expect(valErr.message).toBe('Description must not exceed 2000 characters')
      }
    })

    it('should allow description with exactly 2000 characters', () => {
      const maxDescription = 'd'.repeat(2000)

      const task = Task.create({
        title: 'Título válido',
        description: maxDescription,
      })

      expect(task.description).toBe(maxDescription)
    })

    it('should throw TaskValidationException when status is invalid', () => {
      expect(() =>
        Task.create({
          title: 'Título válido',
          status: 'INVALID_STATUS' as TaskStatus,
        })
      ).toThrow(TaskValidationException)

      try {
        Task.create({
          title: 'Título válido',
          status: 'UNKNOWN' as TaskStatus,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(TaskValidationException)
        const valErr = error as TaskValidationException
        expect(valErr.errorCode).toBe('VALIDATION_ERROR')
        expect(valErr.message).toContain('Invalid task status')
      }
    })
  })

  describe('update method', () => {
    it('should update title and status, renew updatedAt, and return true', () => {
      const initialDate = new Date('2026-01-01T10:00:00Z')
      const task = new Task({
        title: 'Título original',
        description: 'Descrição original',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })

      const changed = task.update({
        title: 'Título atualizado',
        status: TaskStatus.IN_PROGRESS,
      })

      expect(changed).toBe(true)
      expect(task.title).toBe('Título atualizado')
      expect(task.description).toBe('Descrição original')
      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
      expect(task.updatedAt.getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should clear description when null is provided', () => {
      const task = Task.create({
        title: 'Tarefa com descrição',
        description: 'Descrição existente',
      })

      const changed = task.update({ description: null })

      expect(changed).toBe(true)
      expect(task.description).toBeNull()
    })

    it('should return false and keep updatedAt unchanged when no fields are modified (no-op)', () => {
      const initialDate = new Date('2026-01-01T10:00:00Z')
      const task = new Task({
        title: 'Mesmo título',
        description: 'Mesma descrição',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })

      const changedEmpty = task.update({})
      expect(changedEmpty).toBe(false)
      expect(task.updatedAt).toBe(initialDate)

      const changedSame = task.update({
        title: 'Mesmo título',
        description: 'Mesma descrição',
        status: TaskStatus.PENDING,
      })
      expect(changedSame).toBe(false)
      expect(task.updatedAt).toBe(initialDate)
    })

    it('should validate invariants during update and throw TaskValidationException', () => {
      const task = Task.create({ title: 'Título válido' })

      expect(() => task.update({ title: 'a' })).toThrow(TaskValidationException)
      expect(() => task.update({ description: 'd'.repeat(2001) })).toThrow(TaskValidationException)
      expect(() => task.update({ status: 'INVALID' as TaskStatus })).toThrow(TaskValidationException)
    })
  })
})

