import { describe, expect, it } from 'vitest'
import { DomainException } from './domain.exception'
import { TaskNotFoundException } from './task-not-found.exception'

describe('TaskNotFoundException', () => {
  it('should instantiate with correct properties', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000'
    const exception = new TaskNotFoundException(id)

    expect(exception).toBeInstanceOf(Error)
    expect(exception).toBeInstanceOf(DomainException)
    expect(exception.code).toBe('TASK_NOT_FOUND')
    expect(exception.statusCode).toBe(404)
    expect(exception.message).toBe(`Task with id '${id}' not found`)
    expect(exception.name).toBe('TaskNotFoundException')
  })
})
