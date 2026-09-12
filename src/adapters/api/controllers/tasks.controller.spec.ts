import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TasksController } from './tasks.controller'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { Task, TaskStatus } from '../../../domain/model/task.model'
import { CreateTaskDto } from '../dto'

describe('TasksController (Contract / API Spec)', () => {
  let controller: TasksController
  let createTaskUseCase: CreateTaskUseCase

  beforeEach(async () => {
    const mockCreateTaskUseCase = {
      execute: vi.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: CreateTaskUseCase,
          useValue: mockCreateTaskUseCase,
        },
      ],
    }).compile()

    controller = module.get<TasksController>(TasksController)
    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase)
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
