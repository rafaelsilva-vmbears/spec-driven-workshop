import { Inject, Injectable } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import { Task, TaskStatus } from '@domain/model/task.model'
import { TaskRepository } from '@domain/port/repositories/task.repository'
import { DRIZZLE, DrizzleDB } from '../database/drizzle/drizzle.module'
import { tasks } from '../database/drizzle/schema'

@Injectable()
export class DrizzleTaskRepository extends TaskRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {
    super()
  }

  async create(task: Task): Promise<Task> {
    const [row] = await this.db
      .insert(tasks)
      .values({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        deletedAt: task.deletedAt,
      })
      .returning()

    return new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    })
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))

    if (!row) {
      return null
    }

    return new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    })
  }
}
