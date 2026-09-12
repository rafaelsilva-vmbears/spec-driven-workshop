import { describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '@domain/model/task.model'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { CreateTaskDto } from '../dto/create-task.dto'
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

    const controller = new TasksController(mockCreateTaskUseCase)

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
})
