## Why

Permitir que clientes autenticados consultem listas de tarefas com paginação previsível e eficiente baseada em 0-based offset e limite (`page` e `pageSize`), garantindo navegação consistente, contagem total de registros ativos e evitando respostas volumosas que degradem a performance da API e do banco de dados.

## What Changes

- Criação do DTO de query `ListTasksQueryDto` utilizando decorators de `class-validator` (`@IsOptional()`, `@IsInt()`, `@Min()`, `@Max()`) e `class-transformer` (`@Type(() => Number)`).
- Implementação do caso de uso `ListTasksUseCase` em `src/domain/usecase/list-tasks.usecase.ts`, que aplica defaults defensivos (`page: 0`, `pageSize: 10`) e delega a busca paginada para o contrato de repositório `TaskRepository.findAll`.
- Atualização do endpoint `GET /tasks` no `TasksController` substituindo a implementação provisória (stub) pela chamada a `ListTasksUseCase`, mapeando os resultados para `PaginatedTasksResponseDto`.
- Registro e exportação de `ListTasksUseCase` no `TasksModule`.
- Criação de suítes de testes unitários completas para `ListTasksUseCase` e atualização dos testes de `TasksController` cobrindo cenários com parâmetros padrão, customizados e propagação de erros.

## Capabilities

### Modified Capabilities

- `task-api`: Refinamento do requisito "Listagem paginada de tarefas" (GET `/tasks`), consolidando a paginação 0-based (`page` default 0), tamanho de página (`pageSize` default 10, max 100), total de tarefas ativas e desconsideração de registros soft-deleted.

## Impact

- **API & DTOs**: Adição de `ListTasksQueryDto` em `src/adapters/api/dto/list-tasks-query.dto.ts` e reexportação no barrel `src/adapters/api/dto/index.ts`.
- **Domínio**: Implementação de `ListTasksUseCase` em `src/domain/usecase/list-tasks.usecase.ts` e reexportação em `src/domain/usecase/index.ts`.
- **Infraestrutura / Repositório**: Reutilização direta do método já implementado `findAll` em `TaskRepositoryImpl`.
- **Módulos & Controllers**: Atualização de `TasksModule` e `TasksController` com injeção e mapeamento de saída.
- **Testes**: Criação de `src/domain/usecase/list-tasks.usecase.spec.ts` e expansão de `src/adapters/api/controllers/tasks.controller.spec.ts`.
