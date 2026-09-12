## Why

Atualmente, a aplicação não possui um tratamento centralizado de exceções, o que pode resultar em respostas despadronizadas pelo framework ou vazamento de stack traces em falhas internas. Para atender à US-007 e cumprir o contrato definido em `task-api`, é necessário implementar uma infraestrutura unificada de tratamento de erros com `DomainException` e um filtro global de exceções no NestJS.

## What Changes

- Criação da interface de contrato `ErrorResponse` no domínio (`src/domain/exception/error-response.interface.ts`).
- Criação da classe base `DomainException` (`src/domain/exception/domain.exception.ts`) para representar erros de negócio com código semântico e status HTTP associado.
- Criação do filtro global `AllExceptionsFilter` (`src/adapters/api/filters/global-exception.filter.ts`) capturando `DomainException`, `HttpException` e erros não tratados, com formatação JSON e logging estruturado via Pino.
- Registro global do filtro via provider `APP_FILTER` em `src/app.module.ts`.
- Criação de testes unitários abrangentes em `src/adapters/api/filters/global-exception.filter.spec.ts`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `task-api`: Detalhamento dos requisitos normativos e cenários para exceções de domínio, validação e tratamento de falhas 500 com código `INTERNAL_SERVER_ERROR`.

## Impact

- **Domínio**: Estabelece `DomainException` como classe base para todas as futuras exceções de negócio (ex.: `TaskNotFoundException`).
- **Camada de Apresentação**: Todas as respostas 4xx e 5xx passam a ser estritamente padronizadas no formato `ErrorResponse`.
- **Observabilidade**: Falhas 500 registram logs de erro estruturados via Pino sem expor detalhes internos para o cliente.
