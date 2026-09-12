import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiKeyGuard } from './api-key.guard'
import { IS_PUBLIC_KEY } from './public.decorator'

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard
  let reflector: Reflector
  let configService: ConfigService

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector

    configService = {
      get: vi.fn().mockReturnValue('valid-secret-api-key'),
    } as unknown as ConfigService

    guard = new ApiKeyGuard(reflector, configService)
  })

  const createMockContext = (headers: Record<string, string | undefined> = {}): ExecutionContext => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers,
        }),
      }),
    } as unknown as ExecutionContext
  }

  it('should allow access when route is marked as @Public()', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)
    const context = createMockContext()

    const result = guard.canActivate(context)

    expect(result).toBe(true)
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
  })

  it('should throw UnauthorizedException when x-api-key header is missing', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const context = createMockContext({})

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)

    try {
      guard.canActivate(context)
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException)
      const res = (error as UnauthorizedException).getResponse()
      expect(res).toEqual({
        code: 'INVALID_API_KEY',
        message: 'API key is missing or invalid',
      })
    }
  })

  it('should throw UnauthorizedException when x-api-key header is invalid', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const context = createMockContext({ 'x-api-key': 'wrong-key' })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)

    try {
      guard.canActivate(context)
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException)
      const res = (error as UnauthorizedException).getResponse()
      expect(res).toEqual({
        code: 'INVALID_API_KEY',
        message: 'API key is missing or invalid',
      })
    }
  })

  it('should allow access when valid x-api-key header is provided', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const context = createMockContext({ 'x-api-key': 'valid-secret-api-key' })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
  })

  it('should throw UnauthorizedException when API_KEY is not configured in ConfigService', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    vi.spyOn(configService, 'get').mockReturnValue(undefined)
    const context = createMockContext({ 'x-api-key': 'valid-secret-api-key' })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })
})
