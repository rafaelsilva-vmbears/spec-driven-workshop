import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect } from 'vitest'
import { AppModule } from './app.module'
import { DRIZZLE } from './adapters/database/drizzle/drizzle.module'

describe('AppModule', () => {
  it('should compile the module context', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DRIZZLE)
      .useValue({})
      .compile()

    expect(moduleRef).toBeDefined()
    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule)
  })
})
