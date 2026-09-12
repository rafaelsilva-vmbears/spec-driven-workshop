import { Module } from '@nestjs/common'
import { TaskRepository } from '../../../domain/port/repositories/task.repository'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { TaskRepositoryImpl } from '../../database/drizzle/repositories/task.repository.impl'
import { TasksController } from '../controllers/tasks.controller'

@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    {
      provide: TaskRepository,
      useClass: TaskRepositoryImpl,
    },
  ],
  exports: [CreateTaskUseCase, TaskRepository],
})
export class TasksModule {}
