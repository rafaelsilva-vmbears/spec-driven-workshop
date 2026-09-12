import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiKeyGuard } from './api-key.guard'

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard
  let reflector: Reflector
  let configService: ConfigService

  const createMockContext = (headers: Record<string, string | string[] | undefined> = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
      getHandler: () => vi.fn(),
      getClass: () => vi.fn(),
    } as unknown as ExecutionContext
  }

  beforeEach(() => {
    reflector = new Reflector()
    configService = new ConfigService()
    vi.spyOn(configService, 'get').mockReturnValue('valid-secret-key')
    guard = new ApiKeyGuard(reflector, configService)
  })

  it('should reject with 401 and UNAUTHORIZED when x-api-key header is missing', () => {
    const context = createMockContext({})

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)

    try {
      guard.canActivate(context)
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException)
      const exception = err as UnauthorizedException
      expect(exception.getStatus()).toBe(401)
      expect(exception.getResponse()).toMatchObject({
        code: 'UNAUTHORIZED',
      })
    }
  })

  it('should reject with 401 and UNAUTHORIZED when x-api-key header is invalid', () => {
    const context = createMockContext({ 'x-api-key': 'wrong-key' })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)

    try {
      guard.canActivate(context)
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException)
      const exception = err as UnauthorizedException
      expect(exception.getStatus()).toBe(401)
      expect(exception.getResponse()).toMatchObject({
        code: 'UNAUTHORIZED',
      })
    }
  })

  it('should authorize and return true when x-api-key header matches configured API_KEY', () => {
    const context = createMockContext({ 'x-api-key': 'valid-secret-key' })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
  })

  it('should authorize when x-api-key is provided as an array with valid key', () => {
    const context = createMockContext({ 'x-api-key': ['valid-secret-key'] })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
  })

  it('should authorize when header is provided with uppercase X-API-KEY', () => {
    const context = createMockContext({ 'X-API-KEY': 'valid-secret-key' })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
  })

  it('should reject with 401 when API_KEY is not configured in ConfigService', () => {
    vi.spyOn(configService, 'get').mockReturnValue(undefined)
    const context = createMockContext({ 'x-api-key': 'some-key' })

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException)
  })

  it('should authorize and return true when handler is decorated with @Public even without x-api-key', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)
    const context = createMockContext({})

    const result = guard.canActivate(context)

    expect(result).toBe(true)
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      expect.any(Function),
      expect.any(Function),
    ])
  })

  it('should authorize and return true when controller class is decorated with @Public even with invalid key', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)
    const context = createMockContext({ 'x-api-key': 'invalid-key' })

    const result = guard.canActivate(context)

    expect(result).toBe(true)
  })
})
