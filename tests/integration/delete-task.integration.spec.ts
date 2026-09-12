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

  getRawTasks(): Task[] {
    return this.tasks
  }
}

describe('DELETE /tasks/:id (Integration)', () => {
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
      const response = await request(app.getHttpServer()).delete('/tasks/123e4567-e89b-42d3-a456-426614174000')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Missing x-api-key header',
      })
    })

    it('should return 401 when x-api-key header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/123e4567-e89b-42d3-a456-426614174000')
        .set('x-api-key', 'wrong-key')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid API key provided',
      })
    })
  })

  describe('Success Cases (HTTP 204)', () => {
    it('should soft delete active task and return 204 No Content without body', async () => {
      const taskId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      const task = new Task({
        id: taskId,
        title: 'Task to be deleted',
        status: TaskStatus.PENDING,
      })
      inMemoryRepo.addDirectly(task)

      const response = await request(app.getHttpServer()).delete(`/tasks/${taskId}`).set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(204)
      expect(response.text).toBe('')
      expect(response.body).toEqual({})

      // Verify side effect: task is marked as deleted in repository
      const rawTask = inMemoryRepo.getRawTasks().find((t) => t.id === taskId)
      expect(rawTask).toBeDefined()
      expect(rawTask!.isDeleted()).toBe(true)
      expect(rawTask!.deletedAt).toBeInstanceOf(Date)
    })

    it('should ensure deleted task is not accessible via GET /tasks/:id', async () => {
      const taskId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
      const task = new Task({
        id: taskId,
        title: 'Task to verify after delete',
      })
      inMemoryRepo.addDirectly(task)

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('x-api-key', VALID_API_KEY)
      expect(deleteResponse.status).toBe(204)

      const getResponse = await request(app.getHttpServer()).get(`/tasks/${taskId}`).set('x-api-key', VALID_API_KEY)

      expect(getResponse.status).toBe(404)
      expect(getResponse.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${taskId}' not found`,
      })
    })

    it('should ensure deleted task is excluded from GET /tasks listing', async () => {
      const task1 = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        title: 'Remaining Task 1',
      })
      const task2 = new Task({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        title: 'Task to be deleted',
      })
      inMemoryRepo.addDirectly(task1)
      inMemoryRepo.addDirectly(task2)

      // Initial check
      const initialList = await request(app.getHttpServer()).get('/tasks').set('x-api-key', VALID_API_KEY)
      expect(initialList.status).toBe(200)
      expect(initialList.body.total).toBe(2)

      // Delete task 2
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/tasks/${task2.id}`)
        .set('x-api-key', VALID_API_KEY)
      expect(deleteResponse.status).toBe(204)

      // List again: should only contain task 1
      const updatedList = await request(app.getHttpServer()).get('/tasks').set('x-api-key', VALID_API_KEY)
      expect(updatedList.status).toBe(200)
      expect(updatedList.body.total).toBe(1)
      expect(updatedList.body.items).toHaveLength(1)
      expect(updatedList.body.items[0].id).toBe(task1.id)
    })
  })

  describe('Not Found Cases (HTTP 404)', () => {
    it('should return 404 when deleting a non-existent task', async () => {
      const nonExistentId = '123e4567-e89b-42d3-a456-426614174999'

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${nonExistentId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${nonExistentId}' not found`,
      })
    })

    it('should return 404 when attempting to delete an already deleted task (repeated delete)', async () => {
      const taskId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'
      const deletedAt = new Date('2026-01-01T00:00:00.000Z')
      const deletedTask = new Task({
        id: taskId,
        title: 'Already deleted task',
        deletedAt,
      })
      inMemoryRepo.addDirectly(deletedTask)

      const response = await request(app.getHttpServer()).delete(`/tasks/${taskId}`).set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        code: 'TASK_NOT_FOUND',
        message: `Task with id '${taskId}' not found`,
      })

      // Verify that deletedAt was not modified (no side-effects)
      const rawTask = inMemoryRepo.getRawTasks().find((t) => t.id === taskId)
      expect(rawTask!.deletedAt).toBe(deletedAt)
    })
  })

  describe('Validation Failures (HTTP 400)', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/not-a-valid-uuid')
        .set('x-api-key', VALID_API_KEY)

      expect(response.status).toBe(400)
      expect(response.body.code).toBe('BAD_REQUEST')
      expect(response.body.message).toMatch(/uuid.*expected/i)
    })
  })
})
