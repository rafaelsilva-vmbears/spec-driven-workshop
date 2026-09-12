import { Inject, Injectable } from '@nestjs/common'
import { and, count, eq, isNull } from 'drizzle-orm'
import { Task, TaskStatus } from '../../../../domain/model/task.model'
import {
  type FindAllTasksParams,
  type PaginatedResult,
  TaskRepository,
} from '../../../../domain/port/repositories/task.repository'
import { DRIZZLE, type DrizzleDB } from '../drizzle.module'
import { type TaskRow, tasks } from '../schema'

@Injectable()
export class TaskRepositoryImpl implements TaskRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

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

    return this.toDomain(row)
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1)

    if (!row) {
      return null
    }

    return this.toDomain(row)
  }

  async findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>> {
    const page = params.page ?? 0
    const pageSize = params.pageSize ?? 10
    const offset = page * pageSize

    const [countResult] = await this.db
      .select({ total: count() })
      .from(tasks)
      .where(isNull(tasks.deletedAt))

    const total = Number(countResult?.total ?? 0)

    const rows = await this.db
      .select()
      .from(tasks)
      .where(isNull(tasks.deletedAt))
      .limit(pageSize)
      .offset(offset)

    return {
      items: rows.map((r) => this.toDomain(r)),
      total,
      page,
      pageSize,
    }
  }

  async update(task: Task): Promise<Task> {
    const [row] = await this.db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        status: task.status,
        updatedAt: task.updatedAt,
        deletedAt: task.deletedAt,
      })
      .where(and(eq(tasks.id, task.id), isNull(tasks.deletedAt)))
      .returning()

    if (!row) {
      throw new Error(`Task with id ${task.id} not found for update`)
    }

    return this.toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(tasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
  }

  private toDomain(row: TaskRow): Task {
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
