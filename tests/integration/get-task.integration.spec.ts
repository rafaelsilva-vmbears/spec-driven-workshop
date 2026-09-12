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

  clear(): void {
    this.tasks = []
  }

  addDirectly(task: Task): void {
    this.tasks.push(task)
  }
}

describe('GET /tasks/:id (Integration)', () => {
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
      const response = await request(app.getHttpServer()).get(
        '/tasks/123e4567-e89b-42d3-a456-426614174000'
      )

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/123e4567-e89b-42d3-a456-426614174000')
        .set('x-api-key', 'wrong-key')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    })
  })

  describe('Success Cases (HTTP 200)', () => {
    it('should return existing active task details by UUID', async () => {
      const taskId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      const existingTask = new Task({
        id: taskId,
        title: 'Document Task API',
        description: 'Detail specification for US-003',
        status: TaskStatus.IN_PROGRESS,
      })
      inMemoryRepo.addDirectly(existingTask)

      const response = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: taskId,
        title: 'Document Task API',
        description: 'Detail specification for US-003',
        status: TaskStatus.IN_PROGRESS,
        createdAt: existingTask.createdAt.toISOString(),
        updatedAt: existingTask.updatedAt.toISOString(),
      })
    })
  })

  describe('Not Found Cases (HTTP 404)', () => {
    it('should return 404 with TASK_NOT_FOUND when task does not exist', async () => {
      const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

      const response = await request(app.getHttpServer())
        .get(`/tasks/${nonExistentId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${nonExistentId}' not found`,
      })
    })

    it('should return 404 with TASK_NOT_FOUND when task was soft-deleted', async () => {
      const softDeletedId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22'
      const softDeletedTask = new Task({
        id: softDeletedId,
        title: 'Soft-deleted task',
        description: 'Should not be accessible via GET',
        status: TaskStatus.PENDING,
        deletedAt: new Date(),
      })
      inMemoryRepo.addDirectly(softDeletedTask)

      const response = await request(app.getHttpServer())
        .get(`/tasks/${softDeletedId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${softDeletedId}' not found`,
      })
    })
  })

  describe('Validation Failures (HTTP 400)', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const invalidId = 'not-a-valid-uuid'

      const response = await request(app.getHttpServer())
        .get(`/tasks/${invalidId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('BAD_REQUEST')
      expect(response.body.message).toMatch(/uuid.*expected/i)
    })
  })
})
