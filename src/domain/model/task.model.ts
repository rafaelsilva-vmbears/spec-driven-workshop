import { randomUUID } from 'node:crypto'
import { TaskValidationException } from '../exception/task-validation.exception'

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface TaskProps {
  id?: string
  title: string
  description?: string | null
  status?: TaskStatus
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class Task {
  private readonly _id: string
  private readonly _title: string
  private readonly _description: string | null
  private readonly _status: TaskStatus
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | null

  constructor(props: TaskProps) {
    this.validate(props)

    this._id = props.id ?? randomUUID()
    this._title = props.title
    this._description = props.description ?? null
    this._status = props.status ?? TaskStatus.PENDING
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
    this._deletedAt = props.deletedAt ?? null
  }

  get id(): string {
    return this._id
  }

  get title(): string {
    return this._title
  }

  get description(): string | null {
    return this._description
  }

  get status(): TaskStatus {
    return this._status
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  isDeleted(): boolean {
    return this._deletedAt !== null
  }

  delete(): void {
    if (this.isDeleted()) {
      throw new TaskValidationException('Task is already deleted')
    }

    const now = new Date()
    this._deletedAt = now
    this._updatedAt = now
  }

  private validate(props: TaskProps): void {
    if (props.title === undefined || props.title === null) {
      throw new TaskValidationException('Title is required')
    }

    if (typeof props.title !== 'string') {
      throw new TaskValidationException('Title must be a string')
    }

    if (props.title.trim().length === 0) {
      throw new TaskValidationException('Title cannot be empty')
    }

    if (props.title.length < 3 || props.title.length > 100) {
      throw new TaskValidationException('Title must be between 3 and 100 characters')
    }

    if (props.description !== undefined && props.description !== null) {
      if (typeof props.description !== 'string') {
        throw new TaskValidationException('Description must be a string')
      }
      if (props.description.length > 2000) {
        throw new TaskValidationException('Description cannot exceed 2000 characters')
      }
    }

    if (props.status !== undefined) {
      const validStatuses = Object.values(TaskStatus)
      if (!validStatuses.includes(props.status)) {
        throw new TaskValidationException('Invalid status. Allowed values: PENDING, IN_PROGRESS, DONE')
      }
    }

    if (props.id !== undefined) {
      if (!UUID_V4_REGEX.test(props.id)) {
        throw new TaskValidationException('Invalid id format')
      }
    }
  }
}
