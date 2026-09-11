import { ApiProperty } from '@nestjs/swagger'
import { TaskResponseDto } from './task-response.dto'

export class PaginatedTasksResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
    description: 'Lista de tarefas da página solicitada',
  })
  items!: TaskResponseDto[]

  @ApiProperty({
    description: 'Total de tarefas ativas registradas',
    example: 42,
  })
  total!: number

  @ApiProperty({
    description: 'Número da página atual (0-based)',
    example: 0,
  })
  page!: number

  @ApiProperty({
    description: 'Quantidade máxima de itens por página',
    example: 10,
  })
  pageSize!: number
}
