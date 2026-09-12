import { describe, expect, it } from 'vitest'
import { TaskNotFoundException } from './task-not-found.exception'
import { DomainException } from './domain.exception'

describe('TaskNotFoundException', () => {
  it('should instantiate correctly as DomainException with 404 status and TASK_NOT_FOUND code', () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const exception = new TaskNotFoundException(taskId)

    expect(exception).toBeInstanceOf(DomainException)
    expect(exception).toBeInstanceOf(Error)
    expect(exception.statusCode).toBe(404)
    expect(exception.errorCode).toBe('TASK_NOT_FOUND')
    expect(exception.message).toBe(`Task with id ${taskId} was not found`)
    expect(exception.details).toEqual({ taskId })
  })
})
