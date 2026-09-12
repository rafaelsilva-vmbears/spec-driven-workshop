import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Task, TaskStatus } from '@domain/model/task.model'
import { TaskRepository } from '@domain/port/repositories/task.repository'
import { AppModule } from '@src/app.module'

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = []

  async create(task: Task): Promise<Task> {
    this.tasks.push(task)
    return task
  }

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.find((t) => t.id === id && t.deletedAt === null)
    return task ?? null
  }

  async findAll(params: { page: number; pageSize: number }) {
    const active = this.tasks.filter((t) => t.deletedAt === null)
    const offset = params.page * params.pageSize
    return {
      items: active.slice(offset, offset + params.pageSize),
      total: active.length,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  clear(): void {
    this.tasks = []
  }

  getAll(): Task[] {
    return this.tasks
  }
}

describe('POST /tasks (Integration)', () => {
  let app: NestFastifyApplication
  let inMemoryRepo: InMemoryTaskRepository
  const VALID_API_KEY = 'test-api-key-secret'

  beforeAll(async () => {
    inMemoryRepo = new InMemoryTaskRepository()

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TaskRepository)
      .useValue(inMemoryRepo)
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'API_KEY') return VALID_API_KEY
          return undefined
        },
        getOrThrow: (key: string) => {
          if (key === 'API_KEY') return VALID_API_KEY
          if (key === 'DATABASE_URL') return 'postgres://mock:mock@localhost:5432/mock'
          throw new Error(`Missing config ${key}`)
        },
      })
      .compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    inMemoryRepo.clear()
  })

  describe('Authentication', () => {
    it('should return 401 when x-api-key header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task without auth' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', 'wrong-key')
        .send({ title: 'Task with bad auth' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    })
  })

  describe('Success Cases', () => {
    it('should create a task with minimal data (HTTP 201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'Minimal task' })

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: 'Minimal task',
        description: null,
        status: TaskStatus.PENDING,
      })
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
      expect(response.body.createdAt).toBeDefined()
      expect(response.body.updatedAt).toBeDefined()
      expect(inMemoryRepo.getAll()).toHaveLength(1)
    })

    it('should create a task with full data (HTTP 201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'Full task',
          description: 'Detailed description for task',
          status: TaskStatus.IN_PROGRESS,
        })

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        title: 'Full task',
        description: 'Detailed description for task',
        status: TaskStatus.IN_PROGRESS,
      })
      expect(response.body.id).toBeDefined()
      expect(inMemoryRepo.getAll()).toHaveLength(1)
    })
  })

  describe('Validation Failures (HTTP 400)', () => {
    it('should return 400 when title is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
      expect(Array.isArray(response.body.details)).toBe(true)
      expect(inMemoryRepo.getAll()).toHaveLength(0)
    })

    it('should return 400 when title is shorter than 3 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'ab' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
      expect(inMemoryRepo.getAll()).toHaveLength(0)
    })

    it('should return 400 when status is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'Valid title',
          status: 'COMPLETED',
        })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
      expect(inMemoryRepo.getAll()).toHaveLength(0)
    })

    it('should return 400 when unknown properties are sent (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'Valid title',
          extraField: 'not-allowed',
        })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(inMemoryRepo.getAll()).toHaveLength(0)
    })
  })
})
