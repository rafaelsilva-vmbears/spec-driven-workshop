import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class ListTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Número da página (0-based)',
    minimum: 0,
    default: 0,
    example: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  page?: number

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number
}
