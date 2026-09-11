import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { TaskStatus } from './task-status.enum'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Novo título da tarefa',
    minLength: 3,
    maxLength: 100,
    example: 'Implementar autenticação e autorização por API Key',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  title?: string

  @ApiPropertyOptional({
    description: 'Nova descrição detalhada da tarefa',
    maxLength: 2000,
    example: 'Atualização da descrição com novos requisitos',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({
    description: 'Novo status da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus
}
