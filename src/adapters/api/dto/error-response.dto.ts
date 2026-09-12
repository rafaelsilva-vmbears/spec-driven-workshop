import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export interface ErrorResponse {
  code: string
  message: string
  details?: unknown
}

export class ErrorResponseDto implements ErrorResponse {
  @ApiProperty({
    example: 'TASK_NOT_FOUND',
    description: 'Código semântico do erro em SCREAMING_SNAKE_CASE',
  })
  code!: string

  @ApiProperty({
    example: 'Task with id 123e4567-e89b-12d3-a456-426614174000 was not found',
    description: 'Mensagem descritiva do erro',
  })
  message!: string

  @ApiPropertyOptional({
    description: 'Detalhes adicionais da falha ou lista de erros de validação',
  })
  details?: unknown
}
