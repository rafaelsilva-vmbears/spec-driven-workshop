## Context

Consulte `proposal.md` para a motivação e `specs/task-api/spec.md` para os requisitos normativos. A aplicação utiliza NestJS 12 sobre a engine Fastify. Este design detalha a arquitetura de tratamento de erros desacoplada (Clean Architecture), onde o domínio dispara exceções agnósticas de transporte e um filtro global de adaptadores web traduz essas exceções para o payload padronizado `ErrorResponse` consumido via HTTP.

## Goals / Non-Goals

**Goals:**
- Definir a interface de contrato `ErrorResponse` em `src/domain/exception/error-response.interface.ts`.
- Implementar a classe abstrata/base `DomainException` em `src/domain/exception/domain.exception.ts` sem dependências do NestJS.
- Implementar `GlobalExceptionFilter` (ou `AllExceptionsFilter`) em `src/adapters/api/filters/global-exception.filter.ts` com suporte a Fastify e logging estruturado com Pino.
- Registrar o filtro globalmente via provider `APP_FILTER` no `AppModule`.
- Validar comportamento com testes unitários para `DomainException`, `HttpException` e erros 500 inesperados.

**Non-Goals:**
- Implementar o guard de autenticação por API Key (escopo da US-006).
- Criar classes de exceções específicas de tarefas (como `TaskNotFoundException`, que serão introduzidas nas USs de negócio US-003+).

## Decisions

### 1. `DomainException` agnóstica de Framework
- **Decisão**: `DomainException` estende a classe nativa `Error`, mantendo propriedades `errorCode: string`, `statusCode: number` e `details?: Record<string, unknown>`.
- **Alternativas consideradas**: Herdar diretamente de `HttpException` do NestJS.
- **Racional**: Respeitar a Clean Architecture e Inversão de Dependência (DIP). O domínio não deve carregar dependências externas de infraestrutura HTTP.

### 2. Tratamento Polimórfico no Filtro Global
- **Decisão**: O filtro intercepta qualquer exceção e aplica o seguinte mapeamento:
  1. `DomainException`: status HTTP definido na exceção (ex.: 400, 404, 422), `code: exception.errorCode`, `message: exception.message`, `details: exception.details`.
  2. `HttpException`: mapeia o status code do NestJS. Em erros 400 originados por validação (`class-validator`), formata com `code: 'VALIDATION_ERROR'`, mensagem sumarizada e violações mapeadas em `details`.
  3. Erros não tratados (Error genérico): status 500, log de erro estruturado registrado via Pino (`logger.error`), e resposta pública estéril `{ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }`.
- **Alternativas consideradas**: Usar o filtro padrão do NestJS.
- **Racional**: Garante conformidade total com o contrato da spec sem vazar detalhes de infraestrutura ou stack traces em produção.

### 3. Adaptação para Fastify Reply
- **Decisão**: A resposta HTTP é enviada via `response.status(status).send(errorBody)`.
- **Alternativas consideradas**: `response.json()`.
- **Racional**: Fastify não possui o método `.json()` do Express; utilizar `.status().send()` é o padrão idiomático do Fastify Adapter no NestJS.

## Risks / Trade-offs

- **[Vazamento de Detalhes em Erros Internos]** → Mitigado garantindo que qualquer exceção que não seja `DomainException` ou `HttpException` tenha sua mensagem e stack trace omitidos da resposta HTTP e enviados unicamente para o log do Pino.
