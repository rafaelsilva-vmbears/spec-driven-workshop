import { describe, expect, it } from 'vitest'
import { DomainException } from './domain.exception'

class TestBusinessException extends DomainException {
  readonly code = 'TEST_BUSINESS_ERROR'
  readonly statusCode = 400

  constructor(message: string, details?: unknown) {
    super(message, details)
  }
}

class TestNotFoundException extends DomainException {
  readonly code = 'TASK_NOT_FOUND'
  readonly statusCode = 404

  constructor(id: string) {
    super(`Task with id ${id} was not found`)
  }
}

describe('DomainException', () => {
  it('should instantiate a domain exception with code, statusCode, and message', () => {
    const exception = new TestNotFoundException('123e4567-e89b-12d3-a456-426614174000')

    expect(exception).toBeInstanceOf(Error)
    expect(exception).toBeInstanceOf(DomainException)
    expect(exception.code).toBe('TASK_NOT_FOUND')
    expect(exception.statusCode).toBe(404)
    expect(exception.message).toBe('Task with id 123e4567-e89b-12d3-a456-426614174000 was not found')
    expect(exception.details).toBeUndefined()
    expect(exception.name).toBe('TestNotFoundException')
  })

  it('should instantiate a domain exception with custom details', () => {
    const details = { field: 'status', reason: 'invalid transition' }
    const exception = new TestBusinessException('Invalid operation', details)

    expect(exception.code).toBe('TEST_BUSINESS_ERROR')
    expect(exception.statusCode).toBe(400)
    expect(exception.message).toBe('Invalid operation')
    expect(exception.details).toEqual(details)
  })
})
