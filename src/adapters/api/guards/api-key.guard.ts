import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const headers = request.headers ?? {}
    const apiKeyHeader = headers['x-api-key'] ?? headers['X-API-KEY']
    const providedKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader
    const expectedKey = this.configService.get<string>('API_KEY')

    if (!providedKey) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    }

    if (!expectedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    }

    return true
  }
}
