import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código semântico do erro',
    example: 'TASK_NOT_FOUND',
  })
  code!: string

  @ApiProperty({
    description: 'Mensagem explicativa do erro',
    example: 'Task not found',
  })
  message!: string

  @ApiPropertyOptional({
    description: 'Detalhes adicionais ou violações de validação',
    example: { taskId: '550e8400-e29b-41d4-a716-446655440000' },
  })
  details?: Record<string, unknown>
}
