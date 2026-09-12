## Why

Atualmente, o endpoint `POST /tasks` possui apenas um esqueleto que lança erro de método não implementado. Para atender à US-001 e permitir que usuários autenticados registrem tarefas com título, descrição opcional e status (padrão `PENDING`), é necessário implementar o fluxo completo de criação de tarefas seguindo os padrões de Clean Architecture, Rich Domain Model e Inversão de Dependência (DIP) com Drizzle ORM.

## What Changes

- Criação da entidade de domínio `Task` em `src/domain/model/task.model.ts` validando suas próprias invariantes no construtor (título entre 3 e 100 caracteres, descrição de até 2000 caracteres, status válido `PENDING`, `IN_PROGRESS` ou `DONE`) sem dependências de framework.
- Criação da porta abstrata `TaskRepository` em `src/domain/port/repositories/task.repository.ts` definindo os contratos de persistência.
- Implementação do caso de uso `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.ts`.
- Mapeamento da tabela `tasks` no Drizzle ORM em `src/adapters/database/drizzle/schema.ts` com colunas UUID, título, descrição, status, createdAt, updatedAt e deletedAt.
- Implementação do repositório concreto `TaskRepositoryImpl` em `src/adapters/database/drizzle/repositories/task.repository.impl.ts`.
- Integração do `CreateTaskUseCase` no `TasksController` (`POST /tasks`) com conversão para `TaskResponseDto`.
- Criação e registro do `TasksModule` em `src/adapters/api/tasks/tasks.module.ts` (ou `src/adapters/tasks/tasks.module.ts`) e inclusão no `AppModule`.
- Suíte completa de testes unitários para a entidade `Task`, o caso de uso `CreateTaskUseCase`, o repositório e o controller.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `task-api`: Confirmação e consolidação dos cenários de criação de tarefas via `POST /tasks`, garantindo respostas 201 com dados completos e 400 com `VALIDATION_ERROR`.

## Impact

- **Banco de Dados**: Introdução da tabela `tasks` no PostgreSQL via Drizzle ORM.
- **Domínio**: Estabelece o modelo fundamental `Task` e a base para as próximas User Stories (US-002, US-003, US-004, US-005).
- **API**: Endpoint `POST /tasks` torna-se funcional e operacional para clientes autenticados.
