import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { GetTaskByIdUseCase } from './get-task-by-id.usecase'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

describe('GetTaskByIdUseCase', () => {
  let useCase: GetTaskByIdUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository

    useCase = new GetTaskByIdUseCase(taskRepository)
  })

  it('should successfully return active task when found', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const existingTask = new Task({
      id: taskId,
      title: 'Tarefa existente',
      description: 'Descrição válida',
      status: TaskStatus.PENDING,
    })

    vi.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask)

    const result = await useCase.execute(taskId)

    expect(result).toBe(existingTask)
    expect(result.id).toBe(taskId)
    expect(taskRepository.findById).toHaveBeenCalledTimes(1)
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
  })

  it('should throw TaskNotFoundException when task does not exist', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockResolvedValue(null)

    await expect(useCase.execute(taskId)).rejects.toThrow(TaskNotFoundException)

    try {
      await useCase.execute(taskId)
    } catch (error) {
      expect(error).toBeInstanceOf(TaskNotFoundException)
      const notFoundErr = error as TaskNotFoundException
      expect(notFoundErr.errorCode).toBe('TASK_NOT_FOUND')
      expect(notFoundErr.statusCode).toBe(404)
      expect(notFoundErr.message).toBe(`Task with id ${taskId} was not found`)
      expect(notFoundErr.details).toEqual({ taskId })
    }
  })

  it('should throw TaskNotFoundException when task has been soft-deleted', async () => {
    const deletedTaskId = '550e8400-e29b-41d4-a716-446655440001'
    // Repositório filtra tarefas com soft delete retornando null
    vi.spyOn(taskRepository, 'findById').mockResolvedValue(null)

    await expect(useCase.execute(deletedTaskId)).rejects.toThrow(TaskNotFoundException)
  })

  it('should propagate error when repository throws an exception', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockRejectedValue(new Error('Database query error'))

    await expect(useCase.execute(taskId)).rejects.toThrow('Database query error')
  })
})
