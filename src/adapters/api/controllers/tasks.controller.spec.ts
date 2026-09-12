import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TasksController } from './tasks.controller'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { GetTaskByIdUseCase } from '../../../domain/usecase/get-task-by-id.usecase'
import { ListTasksUseCase } from '../../../domain/usecase/list-tasks.usecase'
import { TaskNotFoundException } from '../../../domain/exception/task-not-found.exception'
import { Task, TaskStatus } from '../../../domain/model/task.model'
import { CreateTaskDto } from '../dto'

describe('TasksController (Contract / API Spec)', () => {
  let controller: TasksController
  let createTaskUseCase: CreateTaskUseCase
  let getTaskByIdUseCase: GetTaskByIdUseCase
  let listTasksUseCase: ListTasksUseCase

  beforeEach(async () => {
    const mockCreateTaskUseCase = {
      execute: vi.fn(),
    }
    const mockGetTaskByIdUseCase = {
      execute: vi.fn(),
    }
    const mockListTasksUseCase = {
      execute: vi.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: mockCreateTaskUseCase,
        },
        {
          provide: GetTaskByIdUseCase,
          useValue: mockGetTaskByIdUseCase,
        },
        {
          provide: ListTasksUseCase,
          useValue: mockListTasksUseCase,
        },
      ],
    }).compile()

    controller = module.get<TasksController>(TasksController)
    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase)
    getTaskByIdUseCase = module.get<GetTaskByIdUseCase>(GetTaskByIdUseCase)
    listTasksUseCase = module.get<ListTasksUseCase>(ListTasksUseCase)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should define contract endpoints for US-001 through US-005', () => {
    expect(typeof controller.create).toBe('function')
    expect(typeof controller.list).toBe('function')
    expect(typeof controller.getById).toBe('function')
    expect(typeof controller.update).toBe('function')
    expect(typeof controller.delete).toBe('function')
  })

  describe('create', () => {
    it('should create a task and return mapped TaskResponseDto', async () => {
      const fixedDate = new Date('2026-09-11T12:00:00.000Z')
      const createdTask = new Task({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Nova tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      })

      vi.spyOn(createTaskUseCase, 'execute').mockResolvedValue(createdTask)

      const dto: CreateTaskDto = {
        title: 'Nova tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
      }

      const result = await controller.create(dto)

      expect(createTaskUseCase.execute).toHaveBeenCalledWith({
        title: 'Nova tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
      })

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Nova tarefa',
        description: 'Descrição da tarefa',
        status: TaskStatus.PENDING,
        createdAt: fixedDate.toISOString(),
        updatedAt: fixedDate.toISOString(),
      })
    })
  })

  describe('getById', () => {
    it('should return mapped TaskResponseDto when task is found', async () => {
      const fixedDate = new Date('2026-09-11T12:00:00.000Z')
      const foundTask = new Task({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarefa existente',
        description: 'Descrição da tarefa existente',
        status: TaskStatus.PENDING,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      })

      vi.spyOn(getTaskByIdUseCase, 'execute').mockResolvedValue(foundTask)

      const result = await controller.getById('550e8400-e29b-41d4-a716-446655440000')

      expect(getTaskByIdUseCase.execute).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarefa existente',
        description: 'Descrição da tarefa existente',
        status: TaskStatus.PENDING,
        createdAt: fixedDate.toISOString(),
        updatedAt: fixedDate.toISOString(),
      })
    })

    it('should propagate TaskNotFoundException when task does not exist', async () => {
      vi.spyOn(getTaskByIdUseCase, 'execute').mockRejectedValue(
        new TaskNotFoundException('550e8400-e29b-41d4-a716-446655440000')
      )

      await expect(
        controller.getById('550e8400-e29b-41d4-a716-446655440000')
      ).rejects.toThrow(TaskNotFoundException)
    })
  })

  describe('list', () => {
    it('should return paginated tasks response with default pagination', async () => {
      const fixedDate = new Date('2026-09-11T12:00:00.000Z')
      const mockTask = new Task({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Tarefa existente',
        description: 'Descrição de teste',
        status: TaskStatus.PENDING,
        createdAt: fixedDate,
        updatedAt: fixedDate,
      })

      vi.spyOn(listTasksUseCase, 'execute').mockResolvedValue({
        items: [mockTask],
        total: 1,
        page: 0,
        pageSize: 10,
      })

      const result = await controller.list({})

      expect(listTasksUseCase.execute).toHaveBeenCalledWith({})
      expect(result).toEqual({
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Tarefa existente',
            description: 'Descrição de teste',
            status: TaskStatus.PENDING,
            createdAt: fixedDate.toISOString(),
            updatedAt: fixedDate.toISOString(),
          },
        ],
        total: 1,
        page: 0,
        pageSize: 10,
      })
    })

    it('should return paginated tasks response with custom query parameters', async () => {
      vi.spyOn(listTasksUseCase, 'execute').mockResolvedValue({
        items: [],
        total: 50,
        page: 2,
        pageSize: 5,
      })

      const result = await controller.list({ page: 2, pageSize: 5 })

      expect(listTasksUseCase.execute).toHaveBeenCalledWith({ page: 2, pageSize: 5 })
      expect(result).toEqual({
        items: [],
        total: 50,
        page: 2,
        pageSize: 5,
      })
    })
  })
})

