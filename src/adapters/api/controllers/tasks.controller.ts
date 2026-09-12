import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { CreateTaskDto } from '../dto/create-task.dto'
import { ErrorResponseDto } from '../dto/error-response.dto'
import { TaskResponseDto } from '../dto/task-response.dto'

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiHeader({ name: 'x-api-key', description: 'Chave de API para autenticação' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Erro de validação dos dados de entrada', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado (x-api-key ausente ou inválida)', type: ErrorResponseDto })
  async create(@Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      status: dto.status,
    })
    return TaskResponseDto.fromDomain(task)
  }
}
