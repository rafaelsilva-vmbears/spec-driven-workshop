import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { DomainException } from '@domain/exception/domain.exception'
import { ErrorResponse } from '../dto/error-response.dto'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    let statusCode: number
    let body: ErrorResponse

    if (exception instanceof DomainException) {
      statusCode = exception.statusCode
      body = {
        code: exception.code,
        message: exception.message,
        ...(exception.details !== undefined ? { details: exception.details } : {}),
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>

        if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(res.message)) {
          body = {
            code: (res.code as string) ?? 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: res.message,
          }
        } else if (typeof res.code === 'string') {
          body = {
            code: res.code,
            message: (res.message as string) ?? exception.message,
            ...(res.details !== undefined ? { details: res.details } : {}),
          }
        } else {
          const statusText = HttpStatus[statusCode] ?? 'HTTP_ERROR'
          body = {
            code: statusText,
            message: (res.message as string) ?? exception.message,
            ...(res.details !== undefined ? { details: res.details } : {}),
          }
        }
      } else {
        const statusText = HttpStatus[statusCode] ?? 'HTTP_ERROR'
        body = {
          code: statusText,
          message: typeof exceptionResponse === 'string' ? exceptionResponse : exception.message,
        }
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR
      body = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      }

      this.logger.error(
        {
          err: exception instanceof Error ? { message: exception.message, stack: exception.stack } : exception,
          url: request?.url,
          method: request?.method,
        },
        'Unhandled exception caught by GlobalExceptionFilter'
      )
    }

    response.status(statusCode).send(body)
  }
}
