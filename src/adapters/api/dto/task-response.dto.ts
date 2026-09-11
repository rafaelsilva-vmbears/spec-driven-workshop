import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from './task-status.enum'

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único da tarefa (UUID)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação por API Key',
  })
  title!: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Adicionar validação do header x-api-key no guard global',
  })
  description?: string

  @ApiProperty({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status!: TaskStatus

  @ApiProperty({
    description: 'Data e hora de criação da tarefa',
    example: '2026-09-11T12:00:00.000Z',
  })
  createdAt!: string

  @ApiProperty({
    description: 'Data e hora da última alteração da tarefa',
    example: '2026-09-11T12:00:00.000Z',
  })
  updatedAt!: string
}
