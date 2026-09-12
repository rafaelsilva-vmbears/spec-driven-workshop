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

export interface CreateTaskProps {
  title: string
  description?: string | null
  status?: TaskStatus
}

export interface UpdateTaskProps {
  title?: string
  description?: string | null
  status?: TaskStatus
}

export class Task {
  private readonly _id: string
  private _title: string
  private _description: string | null
  private _status: TaskStatus
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | null

  constructor(props: TaskProps) {
    this.validateTitle(props.title)
    this.validateDescription(props.description)
    this.validateStatus(props.status ?? TaskStatus.PENDING)

    this._id = props.id ?? randomUUID()
    this._title = props.title.trim()
    this._description = props.description !== undefined && props.description !== null ? props.description.trim() : null
    this._status = props.status ?? TaskStatus.PENDING
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
    this._deletedAt = props.deletedAt ?? null
  }

  static create(props: CreateTaskProps): Task {
    return new Task({
      title: props.title,
      description: props.description,
      status: props.status ?? TaskStatus.PENDING,
    })
  }

  update(props: UpdateTaskProps): boolean {
    if (props.title !== undefined) {
      this.validateTitle(props.title)
    }

    if (props.description !== undefined) {
      this.validateDescription(props.description)
    }

    if (props.status !== undefined) {
      this.validateStatus(props.status)
    }

    const newTitle = props.title !== undefined ? props.title.trim() : this._title
    const newDescription =
      props.description !== undefined
        ? props.description !== null
          ? props.description.trim()
          : null
        : this._description
    const newStatus = props.status !== undefined ? props.status : this._status

    const hasChanged =
      newTitle !== this._title || newDescription !== this._description || newStatus !== this._status

    if (!hasChanged) {
      return false
    }

    this._title = newTitle
    this._description = newDescription
    this._status = newStatus
    this._updatedAt = new Date()

    return true
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

  private validateTitle(title: unknown): void {
    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
      throw new TaskValidationException('Title must be between 3 and 100 characters', {
        field: 'title',
        value: title,
      })
    }
  }

  private validateDescription(description?: unknown): void {
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string' || description.length > 2000) {
        throw new TaskValidationException('Description must not exceed 2000 characters', {
          field: 'description',
        })
      }
    }
  }

  private validateStatus(status: unknown): void {
    const validStatuses = Object.values(TaskStatus)
    if (!validStatuses.includes(status as TaskStatus)) {
      throw new TaskValidationException(`Invalid task status: ${status}. Valid values are: ${validStatuses.join(', ')}`, {
        field: 'status',
        value: status,
      })
    }
  }
}
