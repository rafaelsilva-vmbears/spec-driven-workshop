import { Module } from '@nestjs/common'
import { TaskRepository } from '@domain/port/repositories/task.repository'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { GetTaskUseCase } from '@domain/usecase/get-task.usecase'
import { TasksController } from '../api/controllers/tasks.controller'
import { DrizzleTaskRepository } from '../repositories/drizzle-task.repository'

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: TaskRepository,
      useClass: DrizzleTaskRepository,
    },
    {
      provide: CreateTaskUseCase,
      useFactory: (taskRepository: TaskRepository) => new CreateTaskUseCase(taskRepository),
      inject: [TaskRepository],
    },
    {
      provide: GetTaskUseCase,
      useFactory: (taskRepository: TaskRepository) => new GetTaskUseCase(taskRepository),
      inject: [TaskRepository],
    },
  ],
  exports: [TaskRepository, CreateTaskUseCase, GetTaskUseCase],
})
export class TasksModule {}
