import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { TasksController } from './tasks.controller'

describe('TasksController (Contract / API Spec)', () => {
  let controller: TasksController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
    }).compile()

    controller = module.get<TasksController>(TasksController)
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
})
