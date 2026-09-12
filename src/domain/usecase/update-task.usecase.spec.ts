import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { UpdateTaskUseCase } from './update-task.usecase'
import { TaskNotFoundException } from '../exception/task-not-found.exception'

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository

    useCase = new UpdateTaskUseCase(taskRepository)
  })

  it('should successfully update task and persist changes when modified', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const existingTask = new Task({
      id: taskId,
      title: 'Título antigo',
      description: 'Descrição antiga',
      status: TaskStatus.PENDING,
    })

    vi.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask)
    vi.spyOn(taskRepository, 'update').mockImplementation(async (task) => task)

    const result = await useCase.execute({
      id: taskId,
      title: 'Título novo',
      status: TaskStatus.IN_PROGRESS,
    })

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(taskRepository.update).toHaveBeenCalledWith(existingTask)
    expect(result.title).toBe('Título novo')
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should bypass repository update when no fields changed (no-op optimization)', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    const existingTask = new Task({
      id: taskId,
      title: 'Título atual',
      description: 'Descrição atual',
      status: TaskStatus.PENDING,
    })

    vi.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask)

    const result = await useCase.execute({
      id: taskId,
      title: 'Título atual',
      description: 'Descrição atual',
      status: TaskStatus.PENDING,
    })

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(taskRepository.update).not.toHaveBeenCalled()
    expect(result).toBe(existingTask)
  })

  it('should throw TaskNotFoundException when task does not exist', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockResolvedValue(null)

    await expect(
      useCase.execute({
        id: taskId,
        title: 'Novo título',
      })
    ).rejects.toThrow(TaskNotFoundException)

    expect(taskRepository.update).not.toHaveBeenCalled()
  })

  it('should throw TaskNotFoundException when task is soft-deleted', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockResolvedValue(null)

    await expect(
      useCase.execute({
        id: taskId,
        status: TaskStatus.DONE,
      })
    ).rejects.toThrow(TaskNotFoundException)

    expect(taskRepository.update).not.toHaveBeenCalled()
  })

  it('should propagate error when repository throws', async () => {
    const taskId = '550e8400-e29b-41d4-a716-446655440000'
    vi.spyOn(taskRepository, 'findById').mockRejectedValue(new Error('Database connection failed'))

    await expect(
      useCase.execute({
        id: taskId,
        title: 'Novo título',
      })
    ).rejects.toThrow('Database connection failed')
  })
})
