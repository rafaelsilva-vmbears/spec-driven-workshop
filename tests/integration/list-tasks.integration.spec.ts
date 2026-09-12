import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Task, TaskStatus } from '@domain/model/task.model'
import { FindAllTasksParams, PaginatedResult, TaskRepository } from '@domain/port/repositories/task.repository'
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

  async findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>> {
    const active = this.tasks.filter((t) => t.deletedAt === null)
    const offset = params.page * params.pageSize
    const items = active.slice(offset, offset + params.pageSize)

    return {
      items,
      total: active.length,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  async update(task: Task): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      this.tasks[index] = task
    }
    return task
  }

  async delete(id: string): Promise<void> {
    const task = this.tasks.find((t) => t.id === id)
    if (task && !task.isDeleted()) {
      task.delete()
    }
  }

  clear(): void {
    this.tasks = []
  }

  addDirectly(task: Task): void {
    this.tasks.push(task)
  }
}

describe('GET /tasks (Integration)', () => {
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
      const response = await request(app.getHttpServer()).get('/tasks')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await request(app.getHttpServer()).get('/tasks').set('x-api-key', 'wrong-key')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    })
  })

  describe('Success Cases (HTTP 200)', () => {
    it('should return empty list when no tasks exist', async () => {
      const response = await request(app.getHttpServer()).get('/tasks').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        items: [],
        total: 0,
        page: 0,
        pageSize: 10,
      })
    })

    it('should return paginated active tasks with default pagination parameters', async () => {
      const task1 = new Task({
        id: '123e4567-e89b-42d3-a456-426614174001',
        title: 'Task 1',
        description: 'First task',
        status: TaskStatus.PENDING,
      })
      const task2 = new Task({
        id: '123e4567-e89b-42d3-a456-426614174002',
        title: 'Task 2',
        description: 'Second task',
        status: TaskStatus.IN_PROGRESS,
      })
      inMemoryRepo.addDirectly(task1)
      inMemoryRepo.addDirectly(task2)

      const response = await request(app.getHttpServer()).get('/tasks').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        items: [
          {
            id: task1.id,
            title: task1.title,
            description: task1.description,
            status: task1.status,
            createdAt: task1.createdAt.toISOString(),
            updatedAt: task1.updatedAt.toISOString(),
          },
          {
            id: task2.id,
            title: task2.title,
            description: task2.description,
            status: task2.status,
            createdAt: task2.createdAt.toISOString(),
            updatedAt: task2.updatedAt.toISOString(),
          },
        ],
        total: 2,
        page: 0,
        pageSize: 10,
      })
    })

    it('should support custom page and pageSize query parameters', async () => {
      for (let i = 1; i <= 5; i++) {
        inMemoryRepo.addDirectly(
          new Task({
            id: `123e4567-e89b-42d3-a456-42661417400${i}`,
            title: `Task ${i}`,
            description: `Desc ${i}`,
            status: TaskStatus.PENDING,
          })
        )
      }

      const response = await request(app.getHttpServer())
        .get('/tasks?page=1&pageSize=2')
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(5)
      expect(response.body.page).toBe(1)
      expect(response.body.pageSize).toBe(2)
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0].title).toBe('Task 3')
      expect(response.body.items[1].title).toBe('Task 4')
    })

    it('should exclude soft-deleted tasks from items and total count', async () => {
      const activeTask = new Task({
        id: '123e4567-e89b-42d3-a456-426614174001',
        title: 'Active Task',
        description: 'Should be listed',
        status: TaskStatus.PENDING,
      })
      const deletedTask = new Task({
        id: '123e4567-e89b-42d3-a456-426614174002',
        title: 'Deleted Task',
        description: 'Should NOT be listed',
        status: TaskStatus.DONE,
        deletedAt: new Date(),
      })
      inMemoryRepo.addDirectly(activeTask)
      inMemoryRepo.addDirectly(deletedTask)

      const response = await request(app.getHttpServer()).get('/tasks').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(1)
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0].id).toBe(activeTask.id)
    })
  })

  describe('Validation Failures (HTTP 400)', () => {
    it('should return 400 when page is negative', async () => {
      const response = await request(app.getHttpServer()).get('/tasks?page=-1').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
      expect(Array.isArray(response.body.details)).toBe(true)
    })

    it('should return 400 when pageSize is less than 1', async () => {
      const response = await request(app.getHttpServer()).get('/tasks?pageSize=0').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 400 when pageSize exceeds maximum of 100', async () => {
      const response = await request(app.getHttpServer()).get('/tasks?pageSize=101').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 400 when page or pageSize is not a valid integer', async () => {
      const response = await request(app.getHttpServer()).get('/tasks?page=invalid').set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
    })

    it('should return 400 when unknown query parameter is passed', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks?unexpectedParam=hack')
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
      expect(response.body.message).toBe('Validation failed')
    })
  })
})
