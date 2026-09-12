import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Task, TaskStatus } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository'
import { CreateTaskUseCase } from './create-task.usecase'
import { TaskValidationException } from '../exception/task-validation.exception'

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn().mockImplementation((task: Task) => Promise.resolve(task)),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as TaskRepository

    useCase = new CreateTaskUseCase(taskRepository)
  })

  it('should successfully create a task with default status and persist via repository', async () => {
    const command = {
      title: 'Implementar arquitetura limpa',
    }

    const result = await useCase.execute(command)

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.title).toBe('Implementar arquitetura limpa')
    expect(result.status).toBe(TaskStatus.PENDING)
    expect(result.description).toBeNull()
    expect(taskRepository.create).toHaveBeenCalledTimes(1)
    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Implementar arquitetura limpa',
        status: TaskStatus.PENDING,
      })
    )
  })

  it('should successfully create a task with explicit status and description', async () => {
    const command = {
      title: 'Implementar casos de teste',
      description: 'Cobrir cenários felizes e de erro',
      status: TaskStatus.IN_PROGRESS,
    }

    const result = await useCase.execute(command)

    expect(result.title).toBe('Implementar casos de teste')
    expect(result.description).toBe('Cobrir cenários felizes e de erro')
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
    expect(taskRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should abort execution and NOT call repository when task data is invalid', async () => {
    const command = {
      title: 'Oi', // menos de 3 caracteres
    }

    await expect(useCase.execute(command)).rejects.toThrow(TaskValidationException)
    expect(taskRepository.create).not.toHaveBeenCalled()
  })

  it('should propagate repository error when persistence fails', async () => {
    vi.spyOn(taskRepository, 'create').mockRejectedValue(new Error('Database connection failed'))

    const command = {
      title: 'Tarefa com erro de persistência',
    }

    await expect(useCase.execute(command)).rejects.toThrow('Database connection failed')
    expect(taskRepository.create).toHaveBeenCalledTimes(1)
  })
})
