import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { DomainException } from '../../../domain/exception/domain.exception'
import { ErrorResponse } from '../../../domain/exception/error-response.interface'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    }

    if (exception instanceof DomainException) {
      status = exception.statusCode
      errorResponse = {
        code: exception.errorCode,
        message: exception.message,
        details: exception.details,
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>
        const message = resObj.message ?? exception.message

        if (status === HttpStatus.BAD_REQUEST) {
          errorResponse = {
            code: (resObj.code as string) ?? 'VALIDATION_ERROR',
            message: Array.isArray(message) ? message.join('; ') : String(message),
            details: Array.isArray(message) ? { errors: message } : (resObj.details as Record<string, unknown>),
          }
        } else {
          errorResponse = {
            code: (resObj.code as string) ?? (resObj.error as string) ?? 'HTTP_ERROR',
            message: Array.isArray(message) ? message.join('; ') : String(message),
            details: resObj.details as Record<string, unknown> | undefined,
          }
        }
      } else {
        errorResponse = {
          code: 'HTTP_ERROR',
          message: String(exceptionResponse),
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined
      )
    }

    response.status(status).send(errorResponse)
  }
}
