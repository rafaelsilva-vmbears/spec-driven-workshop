import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { TaskStatus } from '@domain/model/task.model'

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implementar autenticação',
    description: 'Título da tarefa (entre 3 e 100 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title!: string

  @ApiPropertyOptional({
    example: 'Configurar guard global e headers',
    description: 'Descrição opcional da tarefa (até 2000 caracteres)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    example: TaskStatus.PENDING,
    description: 'Status inicial da tarefa',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
