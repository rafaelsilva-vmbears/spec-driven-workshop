## Context

Consulte `proposal.md` para a motivação e `specs/task-api/spec.md` para os requisitos normativos. Com a infraestrutura técnica validada na etapa de bootstrap, este design estabelece como o contrato OpenAPI 3.0 será modelado, organizado e servido via Swagger/Scalar em `/api/docs`, integrando as definições das User Stories US-001 a US-007 antes da implementação das camadas de domínio e persistência.

## Goals / Non-Goals

**Goals:**
- Definir os schemas de dados canônicos: `Task`, `CreateTaskInput`, `UpdateTaskInput`, `TaskStatus`, `PaginatedTasksResponse` e `ErrorResponse`.
- Configurar o esquema de segurança `ApiKeyAuth` associado ao header `x-api-key` no OpenAPI.
- Incluir metadados de rastreabilidade `x-us-id` para mapear cada endpoint à sua User Story correspondente.
- Fornecer documentação de exemplos de requisição e códigos de resposta HTTP (200, 201, 204, 400, 401, 404, 500).

**Non-Goals:**
- Implementar a persistência real de tarefas no banco de dados via Drizzle (reservado para US-001+).
- Implementar a lógica de interceptação de exceções (`AllExceptionsFilter`) ou autenticação (`ApiKeyGuard`) em código de produção (reservado para Etapas 3 e 4).
- Criar suítes de testes de integração com banco.

## Decisions

### 1. Documentação OpenAPI via NestJS Swagger integrado ao Fastify
- **Decisão**: Utilizar `@nestjs/swagger` configurado com `DocumentBuilder` no `main.ts` e DTOs tipados com `@ApiProperty()`.
- **Alternativas consideradas**: Manter um arquivo estático `openapi.yaml` separado.
- **Racional**: Integrar a definição de contratos aos DTOs garante que os contratos de entrada e saída permaneçam fortemente tipados no TypeScript e sincronizados com a documentação interativa servida em `/api/docs`, prevenindo o problema de *split-brain*.

### 2. Rastreabilidade com `x-us-id`
- **Decisão**: Adicionar a extensão OpenAPI `x-us-id` em cada operação (`POST /tasks` → `US-001`, `GET /tasks` → `US-002`, etc.) utilizando decorators customizados ou `@ApiOperation({ extension: { 'x-us-id': 'US-XXX' } })`.
- **Alternativas consideradas**: Documentar apenas em comentários ou na descrição textual.
- **Racional**: Permite que suítes de teste, relatórios e ferramentas de conformidade auditem a cobertura de requisitos de negócio diretamente a partir do schema OpenAPI gerado.

### 3. Schema Unificado de Erro (`ErrorResponse`)
- **Decisão**: Padronizar todos os retornos 4xx e 5xx através do DTO `ErrorResponseDto` contendo `code`, `message` e `details?`.
- **Alternativas consideradas**: Utilizar o formato padrão do NestJS (`{ statusCode, message, error }`) ou RFC 7807 (Problem Details).
- **Racional**: Seguir o padrão corporativo definido em `US-007` com códigos semânticos legíveis (`TASK_NOT_FOUND`, `VALIDATION_ERROR`, etc.) facilita o tratamento de erros no cliente.

## Risks / Trade-offs

- **[Contrato antecipado vs Ajustes de Implementação]** → Se alguma regra de negócio for refinada durante o desenvolvimento de uma US específica, o contrato precisará de uma change OpenSpec delta. Isso é intencional no fluxo SDD para assegurar que qualquer alteração de contrato seja conscientemente discutida e rastreada.
