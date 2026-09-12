## Context

Consulte `proposal.md` para motivação e `specs/task-api/spec.md` para a especificação de comportamento e cenários.
O projeto já conta com os alicerces de Clean Architecture e DIP estabelecidos:
- O contrato de repositório `TaskRepository` (`src/domain/port/repositories/task.repository.ts`) já define as interfaces `FindAllTasksParams`, `PaginatedResult<Task>` e o método `abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>`.
- A implementação concreta `TaskRepositoryImpl` com Drizzle ORM já possui o método `findAll` implementado com contagem atômica (`count()`) e paginação com `limit()` e `offset()`, filtrando registros não deletados (`isNull(tasks.deletedAt)`).
- Os DTOs de resposta `PaginatedTasksResponseDto` e `TaskResponseDto` já existem em `src/adapters/api/dto/`.
- O endpoint `GET /tasks` em `TasksController` possui rota definida com decorators Swagger, mas seu corpo atualmente lança uma exceção stub (`Method not implemented — planned for US-002`).

## Goals / Non-Goals

**Goals:**
- Criar o DTO de query `ListTasksQueryDto` utilizando `class-transformer` (`@Type(() => Number)`) e `class-validator` (`@IsOptional()`, `@IsInt()`, `@Min(0)`, `@Max(100)`).
- Implementar o caso de uso `ListTasksUseCase` (`src/domain/usecase/list-tasks.usecase.ts`), injetando `TaskRepository`, aplicando defaults defensivos (`page: 0`, `pageSize: 10`) e retornando `PaginatedResult<Task>`.
- Atualizar o método `list` no `TasksController` para injetar `ListTasksUseCase`, receber `ListTasksQueryDto`, chamar o use case e mapear o resultado para `PaginatedTasksResponseDto`.
- Registrar e exportar `ListTasksUseCase` no `TasksModule`.
- Implementar testes unitários completos em `src/domain/usecase/list-tasks.usecase.spec.ts` e expandir `src/adapters/api/controllers/tasks.controller.spec.ts`.

**Non-Goals:**
- Filtragem por status, busca por texto ou ordenação customizada (reservadas para iterações futuras).
- Alteração na camada de persistência (`TaskRepository` / `TaskRepositoryImpl`), pois a implementação Drizzle já existente atende perfeitamente ao contrato.
- Multi-tenancy ou segregação por usuário (mantém modelo de API Key única por cliente).

## Decisions

### Decisão 1: Validação de Query HTTP com class-transformer e class-validator
- **Opção adotada**: Criar `ListTasksQueryDto` com decorators `@Type(() => Number)` para garantir coerção automática de string de query para number, e validações `@IsOptional()`, `@IsInt()`, `@Min(0)` e `@Max(100)`.
- **Alternativa considerada**: Extrair e converter os parâmetros manualmente no controller. Rejeitada por violar a convenção do NestJS e abrir margem para erros sintáticos de coerção não capturados pelo `ValidationPipe` global.

### Decisão 2: Defaults defensivos aplicados no Use Case
- **Opção adotada**: `ListTasksUseCase` assegura valores padrão `page = params?.page ?? 0` e `pageSize = params?.pageSize ?? 10` antes de invocar o repositório.
- **Alternativa considerada**: Delegar os defaults exclusivamente aos decorators do DTO. Rejeitada pois a camada de domínio deve permanecer robusta e independente da borda HTTP.

### Decisão 3: Mapeamento de Entidade para DTO de Resposta no Controller
- **Opção adotada**: `TasksController` mapeia cada item retornado de `Task` para `TaskResponseDto` serializando timestamps com `.toISOString()` e tratando `description ?? undefined`.
- **Alternativa considerada**: Retornar entidades diretamente na resposta HTTP. Rejeitada para evitar acoplamento do domínio com a representação serializada da API.

## Risks / Trade-offs

- **[Risco]** Parâmetros de query passados como strings alfanuméricas inválidas (ex.: `?page=abc&pageSize=xyz`).  
  → **Mitigação**: `@Type(() => Number)` em conjunto com `@IsInt()` faz com que o `ValidationPipe` global capture a falha e responda com HTTP 400 e payload `ErrorResponse` (`VALIDATION_ERROR`).
- **[Risco]** Requisições solicitando tamanhos de página exorbitantes causando exaustão de memória.  
  → **Mitigação**: `@Max(100)` impõe limite estrito de 100 itens por página.
- **[Risco]** Desalinhamento entre contagem total e paginação caso haja concorrência de exclusão.  
  → **Mitigação**: O repositório realiza as consultas de contagem e busca com filtro consistente `isNull(tasks.deletedAt)`, aceitável para o nível de consistência transacional do MVP.
