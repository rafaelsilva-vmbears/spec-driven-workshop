import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { DeleteTaskUseCase } from './delete-task.usecase'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository

    useCase = new DeleteTaskUseCase(taskRepository)
  })

  it('should successfully delete an active task and invoke taskRepository.delete', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const existingTask = new Task({
      id: taskId,
      title: 'Tarefa para deletar',
      status: TaskStatus.PENDING,
    })

    vi.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask)
    vi.spyOn(taskRepository, 'delete').mockResolvedValue()

    await useCase.execute(taskId)

    expect(existingTask.deletedAt).toBeInstanceOf(Date)
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(taskRepository.delete).toHaveBeenCalledWith(taskId)
    expect(taskRepository.delete).toHaveBeenCalledTimes(1)
  })

  it('should throw TaskNotFoundException and not invoke repository delete when task does not exist', async () => {
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

    expect(taskRepository.delete).not.toHaveBeenCalled()
  })

  it('should throw TaskNotFoundException and avoid side effects when task is already soft-deleted', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440001'
    vi.spyOn(taskRepository, 'findById').mockResolvedValue(null)

    await expect(useCase.execute(taskId)).rejects.toThrow(TaskNotFoundException)
    expect(taskRepository.delete).not.toHaveBeenCalled()
  })

  it('should propagate error when repository findById throws an exception', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockRejectedValue(new Error('Database query error'))

    await expect(useCase.execute(taskId)).rejects.toThrow('Database query error')
    expect(taskRepository.delete).not.toHaveBeenCalled()
  })

  it('should propagate error when repository delete throws an exception', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const existingTask = new Task({
      id: taskId,
      title: 'Tarefa para deletar',
      status: TaskStatus.PENDING,
    })

    vi.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask)
    vi.spyOn(taskRepository, 'delete').mockRejectedValue(new Error('Database delete error'))

    await expect(useCase.execute(taskId)).rejects.toThrow('Database delete error')
  })
})
