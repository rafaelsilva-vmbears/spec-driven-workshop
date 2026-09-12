import { ArgumentsHost, BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DomainException } from '@domain/exception/domain.exception'
import { GlobalExceptionFilter } from './global-exception.filter'

class CustomDomainException extends DomainException {
  readonly code = 'TASK_NOT_FOUND'
  readonly statusCode = 404

  constructor(id: string, details?: unknown) {
    super(`Task with id ${id} was not found`, details)
  }
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter
  let mockStatus: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>
  let mockHost: ArgumentsHost
  let mockRequest: { url: string; method: string }

  beforeEach(() => {
    filter = new GlobalExceptionFilter()

    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ send: mockSend })
    mockRequest = {
      url: '/api/tasks',
      method: 'POST',
    }

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: mockStatus,
        }),
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost
  })

  it('should intercept DomainException and map to corresponding status and payload with details', () => {
    const exception = new CustomDomainException('123', { taskId: '123' })

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(404)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'TASK_NOT_FOUND',
      message: 'Task with id 123 was not found',
      details: { taskId: '123' },
    })
  })

  it('should intercept DomainException without details', () => {
    const exception = new CustomDomainException('456')

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(404)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'TASK_NOT_FOUND',
      message: 'Task with id 456 was not found',
    })
  })

  it('should intercept ValidationPipe BadRequestException and map to VALIDATION_ERROR with details', () => {
    const validationMessages = [
      'title must be longer than or equal to 3 characters',
      'status must be a valid enum value',
    ]
    const exception = new BadRequestException({
      statusCode: 400,
      message: validationMessages,
      error: 'Bad Request',
    })

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: validationMessages,
    })
  })

  it('should intercept BadRequestException with non-array message', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: 'Invalid payload format',
      error: 'Bad Request',
    })

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'BAD_REQUEST',
      message: 'Invalid payload format',
    })
  })

  it('should intercept standard HttpException with string message', () => {
    const exception = new NotFoundException('Resource not found')

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    })
  })

  it('should intercept HttpException with raw string response', () => {
    const exception = new HttpException('Direct string error', HttpStatus.FORBIDDEN)

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'FORBIDDEN',
      message: 'Direct string error',
    })
  })

  it('should intercept HttpException with custom ErrorResponse payload', () => {
    const exception = new HttpException(
      {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
        details: { header: 'x-api-key' },
      },
      HttpStatus.UNAUTHORIZED
    )

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'UNAUTHORIZED',
      message: 'Invalid API key provided',
      details: { header: 'x-api-key' },
    })
  })

  it('should intercept HttpException with non-standard HTTP status code', () => {
    const exception = new HttpException('Custom HTTP failure', 499)

    filter.catch(exception, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(499)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'HTTP_ERROR',
      message: 'Custom HTTP failure',
    })
  })

  it('should intercept unhandled Error, respond HTTP 500 without leaking stack trace, and log structured error', () => {
    const loggerSpy = vi.spyOn(filter['logger'], 'error').mockImplementation(() => {})
    const unhandledError = new Error('Database connection dropped unexpectedly')

    filter.catch(unhandledError, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    })

    expect(loggerSpy).toHaveBeenCalledTimes(1)
    const loggedArg = loggerSpy.mock.calls[0][0]
    expect(loggedArg).toMatchObject({
      url: '/api/tasks',
      method: 'POST',
      err: {
        message: 'Database connection dropped unexpectedly',
      },
    })
  })

  it('should intercept unhandled non-Error thrown objects and log them', () => {
    const loggerSpy = vi.spyOn(filter['logger'], 'error').mockImplementation(() => {})

    filter.catch('string rejection error', mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(mockSend).toHaveBeenCalledWith({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    })

    expect(loggerSpy).toHaveBeenCalledTimes(1)
    const loggedArg = loggerSpy.mock.calls[0][0]
    expect(loggedArg).toMatchObject({
      err: 'string rejection error',
      url: '/api/tasks',
      method: 'POST',
    })
  })
})
