import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AllExceptionsFilter } from './global-exception.filter'
import { DomainException } from '../../../domain/exception/domain.exception'

class TestDomainException extends DomainException {
  constructor() {
    super('Task was not found', 'TASK_NOT_FOUND', 404, { taskId: '123' })
  }
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let mockStatus: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>
  let mockHost: ArgumentsHost

  beforeEach(() => {
    filter = new AllExceptionsFilter()
    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ send: mockSend })

    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue({
          status: mockStatus,
        }),
      }),
    } as unknown as ArgumentsHost
  })

  it('should handle DomainException properly', () => {
    const exception = new TestDomainException()

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(404)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'TASK_NOT_FOUND',
      message: 'Task was not found',
      details: { taskId: '123' },
    })
  })

  it('should handle BadRequestException / validation errors properly', () => {
    const exception = new HttpException(
      {
        statusCode: 400,
        message: ['title must be longer than 3 characters', 'status is invalid'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST
    )

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'VALIDATION_ERROR',
      message: 'title must be longer than 3 characters; status is invalid',
      details: {
        errors: ['title must be longer than 3 characters', 'status is invalid'],
      },
    })
  })

  it('should handle generic HttpException properly', () => {
    const exception = new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED)

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(401)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'HTTP_ERROR',
      message: 'Unauthorized access',
    })
  })

  it('should handle unhandled/unexpected Error with 500 INTERNAL_SERVER_ERROR', () => {
    const exception = new Error('Database connection failed unexpectedly')

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    })
  })
})
