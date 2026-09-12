import { ApiProperty } from '@nestjs/swagger'
import { Task } from '@domain/model/task.model'
import { PaginatedResult } from '@domain/port/repositories/task.repository'
import { TaskResponseDto } from './task-response.dto'

export class PaginatedTasksResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
    description: 'Lista de tarefas da página atual',
  })
  items!: TaskResponseDto[]

  @ApiProperty({
    example: 42,
    description: 'Total de tarefas cadastradas (excluindo soft-deleted)',
  })
  total!: number

  @ApiProperty({
    example: 0,
    description: 'Página atual (0-based)',
  })
  page!: number

  @ApiProperty({
    example: 10,
    description: 'Quantidade de itens por página',
  })
  pageSize!: number

  static fromDomain(result: PaginatedResult<Task>): PaginatedTasksResponseDto {
    const dto = new PaginatedTasksResponseDto()
    dto.items = result.items.map((task) => TaskResponseDto.fromDomain(task))
    dto.total = result.total
    dto.page = result.page
    dto.pageSize = result.pageSize
    return dto
  }
}
