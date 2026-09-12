import { describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '@domain/model/task.model'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { GetTaskUseCase } from '@domain/usecase/get-task.usecase'
import { ListTasksUseCase } from '@domain/usecase/list-tasks.usecase'
import { UpdateTaskUseCase } from '@domain/usecase/update-task.usecase'
import { CreateTaskDto } from '../dto/create-task.dto'
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto'
import { UpdateTaskDto } from '../dto/update-task.dto'
import { TasksController } from './tasks.controller'

describe('TasksController', () => {
  it('should call CreateTaskUseCase with dto and return mapped TaskResponseDto', async () => {
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Controller task',
      description: 'Testing controller',
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    })

    const mockCreateTaskUseCase = {
      execute: vi.fn().mockResolvedValue(task),
    } as unknown as CreateTaskUseCase
    const mockGetTaskUseCase = {} as unknown as GetTaskUseCase
    const mockListTasksUseCase = {} as unknown as ListTasksUseCase
    const mockUpdateTaskUseCase = {} as unknown as UpdateTaskUseCase

    const controller = new TasksController(
      mockCreateTaskUseCase,
      mockGetTaskUseCase,
      mockListTasksUseCase,
      mockUpdateTaskUseCase
    )

    const dto: CreateTaskDto = {
      title: 'Controller task',
      description: 'Testing controller',
      status: TaskStatus.IN_PROGRESS,
    }

    const response = await controller.create(dto)

    expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith(dto)
    expect(response).toEqual({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  })

  it('should call GetTaskUseCase with id and return mapped TaskResponseDto', async () => {
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Found task',
      description: 'Found description',
      status: TaskStatus.IN_PROGRESS,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    })

    const mockCreateTaskUseCase = {} as unknown as CreateTaskUseCase
    const mockGetTaskUseCase = {
      execute: vi.fn().mockResolvedValue(task),
    } as unknown as GetTaskUseCase
    const mockListTasksUseCase = {} as unknown as ListTasksUseCase
    const mockUpdateTaskUseCase = {} as unknown as UpdateTaskUseCase

    const controller = new TasksController(
      mockCreateTaskUseCase,
      mockGetTaskUseCase,
      mockListTasksUseCase,
      mockUpdateTaskUseCase
    )

    const response = await controller.findOne('123e4567-e89b-42d3-a456-426614174000')

    expect(mockGetTaskUseCase.execute).toHaveBeenCalledWith('123e4567-e89b-42d3-a456-426614174000')
    expect(response).toEqual({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  })

  it('should call ListTasksUseCase with query dto and return mapped PaginatedTasksResponseDto', async () => {
    const task = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Paginated task',
      description: 'Pagination testing',
      status: TaskStatus.PENDING,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    })

    const mockPaginatedResult = {
      items: [task],
      total: 1,
      page: 0,
      pageSize: 10,
    }

    const mockCreateTaskUseCase = {} as unknown as CreateTaskUseCase
    const mockGetTaskUseCase = {} as unknown as GetTaskUseCase
    const mockListTasksUseCase = {
      execute: vi.fn().mockResolvedValue(mockPaginatedResult),
    } as unknown as ListTasksUseCase
    const mockUpdateTaskUseCase = {} as unknown as UpdateTaskUseCase

    const controller = new TasksController(
      mockCreateTaskUseCase,
      mockGetTaskUseCase,
      mockListTasksUseCase,
      mockUpdateTaskUseCase
    )

    const query: ListTasksQueryDto = { page: 0, pageSize: 10 }
    const response = await controller.list(query)

    expect(mockListTasksUseCase.execute).toHaveBeenCalledWith({ page: 0, pageSize: 10 })
    expect(response).toEqual({
      items: [
        {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      ],
      total: 1,
      page: 0,
      pageSize: 10,
    })
  })

  it('should use default page 0 and pageSize 10 when query properties are undefined', async () => {
    const mockPaginatedResult = {
      items: [],
      total: 0,
      page: 0,
      pageSize: 10,
    }

    const mockCreateTaskUseCase = {} as unknown as CreateTaskUseCase
    const mockGetTaskUseCase = {} as unknown as GetTaskUseCase
    const mockListTasksUseCase = {
      execute: vi.fn().mockResolvedValue(mockPaginatedResult),
    } as unknown as ListTasksUseCase
    const mockUpdateTaskUseCase = {} as unknown as UpdateTaskUseCase

    const controller = new TasksController(
      mockCreateTaskUseCase,
      mockGetTaskUseCase,
      mockListTasksUseCase,
      mockUpdateTaskUseCase
    )

    const query = {} as ListTasksQueryDto
    const response = await controller.list(query)

    expect(mockListTasksUseCase.execute).toHaveBeenCalledWith({ page: 0, pageSize: 10 })
    expect(response).toEqual({
      items: [],
      total: 0,
      page: 0,
      pageSize: 10,
    })
  })

  it('should call UpdateTaskUseCase with id and dto and return mapped TaskResponseDto', async () => {
    const updatedTask = new Task({
      id: '123e4567-e89b-42d3-a456-426614174000',
      title: 'Updated controller task',
      description: 'Updated testing controller',
      status: TaskStatus.DONE,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      deletedAt: null,
    })

    const mockCreateTaskUseCase = {} as unknown as CreateTaskUseCase
    const mockGetTaskUseCase = {} as unknown as GetTaskUseCase
    const mockListTasksUseCase = {} as unknown as ListTasksUseCase
    const mockUpdateTaskUseCase = {
      execute: vi.fn().mockResolvedValue(updatedTask),
    } as unknown as UpdateTaskUseCase

    const controller = new TasksController(
      mockCreateTaskUseCase,
      mockGetTaskUseCase,
      mockListTasksUseCase,
      mockUpdateTaskUseCase
    )

    const dto: UpdateTaskDto = {
      title: 'Updated controller task',
      description: 'Updated testing controller',
      status: TaskStatus.DONE,
    }

    const response = await controller.update('123e4567-e89b-42d3-a456-426614174000', dto)

    expect(mockUpdateTaskUseCase.execute).toHaveBeenCalledWith('123e4567-e89b-42d3-a456-426614174000', dto)
    expect(response).toEqual({
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    })
  })
})
