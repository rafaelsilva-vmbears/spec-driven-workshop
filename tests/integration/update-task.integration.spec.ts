import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
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
    return {
      items: active.slice(offset, offset + params.pageSize),
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

describe('PATCH /tasks/:id (Integration)', () => {
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
        .patch('/tasks/123e4567-e89b-42d3-a456-426614174000')
        .send({ title: 'New title' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/tasks/123e4567-e89b-42d3-a456-426614174000')
        .set('x-api-key', 'wrong-key')
        .send({ title: 'New title' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    })
  })

  describe('Success Cases (HTTP 200)', () => {
    it('should update title only and return updated task', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Initial Title',
        description: 'Initial Description',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'Updated Title' })

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(task.id)
      expect(response.body.title).toBe('Updated Title')
      expect(response.body.description).toBe('Initial Description')
      expect(response.body.status).toBe(TaskStatus.PENDING)
      expect(response.body.createdAt).toBe(initialDate.toISOString())
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should update description only and return updated task', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        title: 'Initial Title',
        description: 'Initial Description',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ description: 'Brand new description' })

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Initial Title')
      expect(response.body.description).toBe('Brand new description')
      expect(response.body.status).toBe(TaskStatus.PENDING)
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should update status only and return updated task', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        title: 'Initial Title',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ status: TaskStatus.IN_PROGRESS })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe(TaskStatus.IN_PROGRESS)
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should update multiple fields simultaneously', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        title: 'Initial Title',
        description: 'Initial Description',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'All Updated',
          description: 'Combined description',
          status: TaskStatus.DONE,
        })

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('All Updated')
      expect(response.body.description).toBe('Combined description')
      expect(response.body.status).toBe(TaskStatus.DONE)
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should clear description when null is passed', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        title: 'Initial Title',
        description: 'Existing to be cleared',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ description: null })

      expect(response.status).toBe(200)
      expect(response.body.description).toBeNull()
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(initialDate.getTime())
    })

    it('should perform no-op when fields are unchanged or payload is empty', async () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z')
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        title: 'Identical Title',
        description: 'Identical Description',
        status: TaskStatus.PENDING,
        createdAt: initialDate,
        updatedAt: initialDate,
      })
      inMemoryRepo.addDirectly(task)

      const updateSpy = vi.spyOn(inMemoryRepo, 'update')

      const responseSameValues = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({
          title: 'Identical Title',
          description: 'Identical Description',
          status: TaskStatus.PENDING,
        })

      expect(responseSameValues.status).toBe(200)
      expect(responseSameValues.body.updatedAt).toBe(initialDate.toISOString())
      expect(updateSpy).not.toHaveBeenCalled()

      const responseEmpty = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({})

      expect(responseEmpty.status).toBe(200)
      expect(responseEmpty.body.updatedAt).toBe(initialDate.toISOString())
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('Not Found Cases (HTTP 404)', () => {
    it('should return 404 when task does not exist', async () => {
      const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${nonExistentId}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'New title' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${nonExistentId}' not found`,
      })
    })

    it('should return 404 when task was soft-deleted', async () => {
      const softDeletedId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22'
      const softDeletedTask = new Task({
        id: softDeletedId,
        title: 'Soft-deleted task',
        status: TaskStatus.PENDING,
        deletedAt: new Date(),
      })
      inMemoryRepo.addDirectly(softDeletedTask)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${softDeletedId}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'Try to update deleted' })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${softDeletedId}' not found`,
      })
    })
  })

  describe('Validation Failures (HTTP 400)', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .patch('/tasks/invalid-uuid')
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'Valid Title' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('BAD_REQUEST')
      expect(response.body.message).toMatch(/uuid.*expected/i)
    })

    it('should return 400 when title is shorter than 3 characters', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'ab' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when title is longer than 100 characters', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: 'a'.repeat(101) })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when title is null or empty', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const responseNull = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: null })

      expect(responseNull.status).toBe(400)
      expect(responseNull.body.code).toBe('VALIDATION_ERROR')

      const responseEmpty = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ title: '' })

      expect(responseEmpty.status).toBe(400)
      expect(responseEmpty.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when description exceeds 2000 characters', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ description: 'd'.repeat(2001) })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when status is invalid', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ status: 'INVALID_STATUS' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when payload contains unknown properties', async () => {
      const task = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        title: 'Initial Title',
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ unexpectedField: 'hack' })

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('VALIDATION_ERROR')
    })
  })
})
