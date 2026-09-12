import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { DeleteTaskUseCase } from '@domain/usecase/delete-task.usecase'
import { GetTaskUseCase } from '@domain/usecase/get-task.usecase'
import { ListTasksUseCase } from '@domain/usecase/list-tasks.usecase'
import { UpdateTaskUseCase } from '@domain/usecase/update-task.usecase'
import { CreateTaskDto } from '../dto/create-task.dto'
import { ErrorResponseDto } from '../dto/error-response.dto'
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto'
import { PaginatedTasksResponseDto } from '../dto/paginated-tasks-response.dto'
import { TaskResponseDto } from '../dto/task-response.dto'
import { UpdateTaskDto } from '../dto/update-task.dto'

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase
  ) {}

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

  @Get()
  @ApiOperation({ summary: 'Listar tarefas com paginação' })
  @ApiHeader({ name: 'x-api-key', description: 'Chave de API para autenticação' })
  @ApiResponse({ status: 200, description: 'Tarefas listadas com sucesso', type: PaginatedTasksResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetros de query inválidos', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado (x-api-key ausente ou inválida)', type: ErrorResponseDto })
  async list(@Query() query: ListTasksQueryDto): Promise<PaginatedTasksResponseDto> {
    const result = await this.listTasksUseCase.execute({
      page: query.page ?? 0,
      pageSize: query.pageSize ?? 10,
    })
    return PaginatedTasksResponseDto.fromDomain(result)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar tarefa por ID' })
  @ApiHeader({ name: 'x-api-key', description: 'Chave de API para autenticação' })
  @ApiParam({ name: 'id', description: 'Identificador único da tarefa (UUID v4)', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada com sucesso', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'ID inválido (esperado UUID v4)', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado (x-api-key ausente ou inválida)', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada', type: ErrorResponseDto })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<TaskResponseDto> {
    const task = await this.getTaskUseCase.execute(id)
    return TaskResponseDto.fromDomain(task)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parcialmente uma tarefa' })
  @ApiHeader({ name: 'x-api-key', description: 'Chave de API para autenticação' })
  @ApiParam({ name: 'id', description: 'Identificador único da tarefa (UUID v4)', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou ID em formato inválido', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado (x-api-key ausente ou inválida)', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada ou excluída', type: ErrorResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTaskDto
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskUseCase.execute(id, dto)
    return TaskResponseDto.fromDomain(task)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir logicamente uma tarefa' })
  @ApiHeader({ name: 'x-api-key', description: 'Chave de API para autenticação' })
  @ApiParam({ name: 'id', description: 'Identificador único da tarefa (UUID v4)', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Tarefa excluída com sucesso (sem conteúdo)' })
  @ApiResponse({ status: 400, description: 'ID inválido (esperado UUID v4)', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado (x-api-key ausente ou inválida)', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada ou já excluída', type: ErrorResponseDto })
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.deleteTaskUseCase.execute(id)
  }
}
