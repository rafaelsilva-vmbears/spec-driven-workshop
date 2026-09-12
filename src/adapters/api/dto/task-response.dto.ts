import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Task, TaskStatus } from '@domain/model/task.model'

export class TaskResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-42d3-a456-426614174000',
    description: 'Identificador único da tarefa (UUID v4)',
  })
  id!: string

  @ApiProperty({
    example: 'Implementar autenticação',
    description: 'Título da tarefa',
  })
  title!: string

  @ApiPropertyOptional({
    example: 'Configurar guard global e headers',
    description: 'Descrição da tarefa',
    nullable: true,
  })
  description!: string | null

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    description: 'Status atual da tarefa',
  })
  status!: TaskStatus

  @ApiProperty({
    example: '2026-09-12T20:00:00.000Z',
    description: 'Data e hora de criação da tarefa',
  })
  createdAt!: Date

  @ApiProperty({
    example: '2026-09-12T20:00:00.000Z',
    description: 'Data e hora da última atualização da tarefa',
  })
  updatedAt!: Date

  static fromDomain(task: Task): TaskResponseDto {
    const dto = new TaskResponseDto()
    dto.id = task.id
    dto.title = task.title
    dto.description = task.description
    dto.status = task.status
    dto.createdAt = task.createdAt
    dto.updatedAt = task.updatedAt
    return dto
  }
}
