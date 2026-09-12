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

export interface UpdateTaskProps {
  title?: string
  description?: string | null
  status?: TaskStatus
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class Task {
  private readonly _id: string
  private _title: string
  private _description: string | null
  private _status: TaskStatus
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

  update(props: UpdateTaskProps): boolean {
    if (this.isDeleted()) {
      throw new TaskValidationException('Task is already deleted')
    }

    this.validateUpdate(props)

    const titleChanged = props.title !== undefined && props.title !== this._title
    const descChanged = props.description !== undefined && props.description !== this._description
    const statusChanged = props.status !== undefined && props.status !== this._status

    const hasChanges = titleChanged || descChanged || statusChanged

    if (!hasChanges) {
      return false
    }

    if (titleChanged) {
      this._title = props.title!
    }
    if (descChanged) {
      this._description = props.description!
    }
    if (statusChanged) {
      this._status = props.status!
    }

    this._updatedAt = new Date()
    return true
  }

  private validate(props: TaskProps): void {
    this.validateTitle(props.title)
    this.validateDescription(props.description)
    this.validateStatus(props.status)

    if (props.id !== undefined) {
      if (!UUID_V4_REGEX.test(props.id)) {
        throw new TaskValidationException('Invalid id format')
      }
    }
  }

  private validateUpdate(props: UpdateTaskProps): void {
    if (props.title !== undefined) {
      this.validateTitle(props.title)
    }
    if (props.description !== undefined) {
      this.validateDescription(props.description)
    }
    if (props.status !== undefined) {
      this.validateStatus(props.status)
    }
  }

  private validateTitle(title: unknown): void {
    if (title === undefined || title === null) {
      throw new TaskValidationException('Title is required')
    }

    if (typeof title !== 'string') {
      throw new TaskValidationException('Title must be a string')
    }

    if (title.trim().length === 0) {
      throw new TaskValidationException('Title cannot be empty')
    }

    if (title.length < 3 || title.length > 100) {
      throw new TaskValidationException('Title must be between 3 and 100 characters')
    }
  }

  private validateDescription(description: unknown): void {
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        throw new TaskValidationException('Description must be a string')
      }
      if (description.length > 2000) {
        throw new TaskValidationException('Description cannot exceed 2000 characters')
      }
    }
  }

  private validateStatus(status: unknown): void {
    if (status !== undefined) {
      const validStatuses = Object.values(TaskStatus)
      if (!validStatuses.includes(status as TaskStatus)) {
        throw new TaskValidationException('Invalid status. Allowed values: PENDING, IN_PROGRESS, DONE')
      }
    }
  }
}
