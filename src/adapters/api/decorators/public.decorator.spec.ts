import { describe, expect, it } from 'vitest'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY, Public } from './public.decorator'

describe('Public decorator', () => {
  const reflector = new Reflector()

  it('should define IS_PUBLIC_KEY metadata as true on a method', () => {
    class TestController {
      @Public()
      publicEndpoint() {
        return 'ok'
      }
    }

    const instance = new TestController()
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, instance.publicEndpoint)

    expect(isPublic).toBe(true)
  })

  it('should define IS_PUBLIC_KEY metadata as true on a class', () => {
    @Public()
    class TestController {
      endpoint() {
        return 'ok'
      }
    }

    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController)

    expect(isPublic).toBe(true)
  })
})
