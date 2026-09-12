import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from './public.decorator'

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

    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers['x-api-key']
    const expectedApiKey = this.configService.get<string>('API_KEY')

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException({
        code: 'INVALID_API_KEY',
        message: 'API key is missing or invalid',
      })
    }

    return true
  }
}
