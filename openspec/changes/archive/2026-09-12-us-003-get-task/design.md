## Context

Consulte `proposal.md` para motivação e `specs/task-api/spec.md` para os requisitos normativos. A aplicação já dispõe da infraestrutura de Clean Architecture com Drizzle ORM, a porta `TaskRepository`, o modelo de domínio `Task`, o módulo `TasksModule`, autenticação global por `ApiKeyGuard` e tratamento unificado de erros com `AllExceptionsFilter`.

Este design detalha a implementação da consulta unitária de tarefa por ID (US-003).

## Goals / Non-Goals

**Goals:**
- Implementar a exceção de domínio `TaskNotFoundException` em `src/domain/exception/task-not-found.exception.ts` (`errorCode: 'TASK_NOT_FOUND'`, `statusCode: 404`).
- Implementar o caso de uso `GetTaskByIdUseCase` em `src/domain/usecase/get-task-by-id.usecase.ts` consumindo a abstração `TaskRepository`.
- Proteger o endpoint `GET /tasks/:id` com `new ParseUUIDPipe({ version: '4' })` para validação sintática na borda.
- Retornar o DTO `TaskResponseDto` com datas no formato ISO-8601 string.
- Registrar `GetTaskByIdUseCase` no `TasksModule` e cobrir use case e controller com testes unitários abrangentes.

**Non-Goals:**
- Implementar listagem paginada (US-002), atualização parcial (US-004) ou comando de soft delete (US-005).
- Alterar o schema do banco de dados (a coluna `deleted_at` e a tabela `tasks` já existem e suportam a consulta).

## Decisions

### 1. Exceção de Domínio Semântica `TaskNotFoundException`
- **Decisão**: Criar `TaskNotFoundException` derivada de `DomainException` contendo mensagem descritiva (`Task with id ${id} was not found`), código `TASK_NOT_FOUND`, status `404` e detalhes `{ taskId: id }`.
- **Alternativas consideradas**: Lançar `NotFoundException` nativa do NestJS dentro do controller.
- **Racional**: Regras de existência e disponibilidade de entidades pertencem à camada de domínio/aplicação, não ao framework HTTP. O `AllExceptionsFilter` intercepta `DomainException` e monta o payload estruturado `ErrorResponse` de forma automática e transparente.

### 2. Validação Rápida na Borda com `ParseUUIDPipe`
- **Decisão**: Anotar o parâmetro `@Param('id', new ParseUUIDPipe({ version: '4' }))` no `TasksController`.
- **Alternativas consideradas**: Permitir qualquer string chegar ao use case e validar com regex ou deixar o banco rejeitar.
- **Racional**: Falhas de formato sintático de identificador devem ser barradas imediatamente na camada de transporte HTTP (Fail-Fast), poupando processamento de use case e consultas desnecessárias ao banco de dados.

### 3. Filtro de Soft Delete na Consulta
- **Decisão**: O `TaskRepositoryImpl.findById` busca registros garantindo que `deletedAt` seja nulo (`isNull(tasks.deletedAt)`).
- **Alternativas consideradas**: Retornar tarefas deletadas e checar no use case.
- **Racional**: O repositório encapsula o filtro de persistência para que tarefas com soft delete sejam semanticamente inexistentes para leituras ativas.

## Risks / Trade-offs

- **[Padronização do Erro de Validação de UUID]** → O `ParseUUIDPipe` lança `BadRequestException`. O `AllExceptionsFilter` intercepta o erro e formata a resposta com HTTP 400 e `VALIDATION_ERROR`, cumprindo os requisitos normativos do contrato OpenAPI.
