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
import { ApiExtension, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import {
  CreateTaskDto,
  ErrorResponseDto,
  PaginatedTasksResponseDto,
  TaskResponseDto,
  UpdateTaskDto,
} from '../dto'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { GetTaskByIdUseCase } from '../../../domain/usecase/get-task-by-id.usecase'

@ApiTags('tasks')
@ApiSecurity('ApiKeyAuth')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar tarefa',
    description: 'Cria uma nova tarefa no sistema com status inicial PENDING',
  })
  @ApiExtension('x-us-id', 'US-001')
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Autenticação necessária ou API Key inválida',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      status: dto.status,
    })

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas com paginação',
    description: 'Recupera lista paginada de tarefas ativas registradas',
  })
  @ApiExtension('x-us-id', 'US-002')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0, description: 'Página (0-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10, description: 'Itens por página' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tarefas recuperada',
    type: PaginatedTasksResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Autenticação necessária ou API Key inválida',
    type: ErrorResponseDto,
  })
  async list(@Query('page') _page?: number, @Query('pageSize') _pageSize?: number): Promise<PaginatedTasksResponseDto> {
    throw new Error('Method not implemented — planned for US-002')
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar detalhes de uma tarefa',
    description: 'Recupera os dados completos de uma tarefa específica a partir do seu ID',
  })
  @ApiExtension('x-us-id', 'US-003')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identificador único da tarefa (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (não é UUID)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Autenticação necessária ou API Key inválida',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
    type: ErrorResponseDto,
  })
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ): Promise<TaskResponseDto> {
    const task = await this.getTaskByIdUseCase.execute(id)

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar parcialmente uma tarefa',
    description: 'Atualiza campos permitidos de uma tarefa existente',
  })
  @ApiExtension('x-us-id', 'US-004')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identificador único da tarefa (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de atualização ou ID inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Autenticação necessária ou API Key inválida',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
    type: ErrorResponseDto,
  })
  async update(@Param('id') _id: string, @Body() _dto: UpdateTaskDto): Promise<TaskResponseDto> {
    throw new Error('Method not implemented — planned for US-004')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover uma tarefa',
    description: 'Marca uma tarefa existente como removida (soft delete)',
  })
  @ApiExtension('x-us-id', 'US-005')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Identificador único da tarefa (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Tarefa removida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (não é UUID)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Autenticação necessária ou API Key inválida',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
    type: ErrorResponseDto,
  })
  async delete(@Param('id') _id: string): Promise<void> {
    throw new Error('Method not implemented — planned for US-005')
  }
}
