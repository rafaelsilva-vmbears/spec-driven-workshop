import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator'
import { TaskStatus } from '@domain/model/task.model'

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Implementar autenticação',
    description: 'Título da tarefa (entre 3 e 100 caracteres)',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title?: string

  @ApiPropertyOptional({
    example: 'Configurar guard global e headers',
    description: 'Descrição opcional da tarefa (até 2000 caracteres, ou null para limpar)',
    nullable: true,
  })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Status da tarefa',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
