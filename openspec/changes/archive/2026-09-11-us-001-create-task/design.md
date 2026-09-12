## Context

Consulte `proposal.md` para motivação e `specs/task-api/spec.md` para os requisitos normativos. A aplicação já possui a infraestrutura base do NestJS com Fastify, Swagger/Scalar configurado com OpenAPI DTOs para tasks (`CreateTaskDto`, `TaskResponseDto`), tratamento global de exceções (`AllExceptionsFilter`) e autenticação por API Key (`ApiKeyGuard`).

Este design estabelece a arquitetura da primeira User Story de negócio (US-001), consolidando os padrões de Clean Architecture, Rich Domain Model e Inversão de Dependência (DIP) com Drizzle ORM sobre PostgreSQL.

## Goals / Non-Goals

**Goals:**
- Implementar o Rich Domain Model `Task` com validação de invariantes no construtor/fábrica (regras de tamanho de título, descrição e integridade do status).
- Definir a porta `TaskRepository` como classe abstrata para permitir injeção direta sem tokens arbitrários (DIP idiomático no NestJS).
- Implementar o caso de uso `CreateTaskUseCase` isolado de frameworks e focado no fluxo de negócio.
- Definir a tabela `tasks` no Drizzle ORM e implementar `TaskRepositoryImpl` conectado ao PostgreSQL.
- Conectar o `TasksController.create` ao caso de uso, validando DTOs com `ValidationPipe` e mapeando a resposta para `TaskResponseDto`.
- Criar suítes de testes unitários com 100% de cobertura de invariantes na entidade `Task` e no caso de uso `CreateTaskUseCase`.

**Non-Goals:**
- Implementar os use cases das demais USs (busca por ID, paginação, update e delete, que serão abordados nas US-002 a US-005).
- Criar migrações Drizzle adicionais além do schema base `tasks`.

## Decisions

### 1. Rich Domain Model (Não Anêmico)
- **Decisão**: A entidade `Task` em `src/domain/model/task.model.ts` é uma classe pura TypeScript que valida suas próprias invariantes no construtor ou método fábrica.
- **Alternativas consideradas**: Entidade anêmica com validação apenas em pipes do NestJS / class-validator.
- **Racional**: A camada de domínio deve ser a guardiã das regras de negócio. Caso o domínio receba dados inválidos de qualquer porta de entrada (API, mensageria, CLI), ele rejeita com `DomainException` imediatamente, prevenindo estados inconsistentes. Decorators de framework são proibidos no domínio.

### 2. Inversão de Dependência (DIP) via Classes Abstratas
- **Decisão**: `TaskRepository` em `src/domain/port/repositories/task.repository.ts` é declarado como classe abstrata (`export abstract class TaskRepository`).
- **Alternativas consideradas**: Interface TypeScript com token `@Inject('TASK_REPOSITORY')`.
- **Racional**: TypeScript elimina interfaces durante a transpilação, exigindo `@Inject(SYMBOL)` manual. Classes abstratas permanecem em runtime como identificadores válidos para o container de injeção de dependência do NestJS (`{ provide: TaskRepository, useClass: TaskRepositoryImpl }`), resultando em código limpo, desacoplado e fortemente tipado.

### 3. Persistência com Drizzle ORM e Mapeamento Bidirecional
- **Decisão**: A tabela `tasks` é mapeada em `src/adapters/database/drizzle/schema.ts` com colunas UUID, `title`, `description`, `status`, `created_at`, `updated_at` e `deleted_at`. O repositório `TaskRepositoryImpl` injeta o client Drizzle (`@Inject(DRIZZLE)`) e converte os registros do banco em instâncias de `Task` de domínio.
- **Alternativas consideradas**: Usar o modelo do Drizzle diretamente no use case.
- **Racional**: Evita vazamento de detalhes de persistência e SQL para as camadas de use case e domínio.

### 4. Modularização via `TasksModule`
- **Decisão**: Encapsular controller, use cases e repositório em `src/adapters/api/tasks/tasks.module.ts` e importá-lo no `AppModule`.
- **Alternativas consideradas**: Declarar todos os providers soltos no `AppModule`.
- **Racional**: Garante separação de contextos, organização limpa e modularidade escalável à medida que novas USs forem adicionadas.

## Risks / Trade-offs

- **[Configuração do Banco Local para Execução Real]** → Em testes unitários, o repositório é mockado garantindo rapidez e isolamento total (sem necessidade de banco ligado para rodar `pnpm test`). A tabela Drizzle é validada em compilação e tipagem estática.
- **[Duplicação entre DTO e Domínio]** → DTOs validam a entrada HTTP na borda (`ValidationPipe`), enquanto `Task` protege a integridade conceitual do modelo. Essa aparente duplicação é o pilar da defesa em profundidade da Clean Architecture.
