# 03: Fatia Vertical de Criação de Tarefa (POST /tasks)

**What to build:** A capacidade ponta a ponta de registrar uma nova tarefa no sistema através do endpoint `POST /tasks`. Inclui o modelo de domínio rico `Task` com validação estrita de suas invariantes, persistência relacional no PostgreSQL via Drizzle ORM, inversão de dependência através de contrato de repositório abstrato, use case com orquestração de criação e endpoint RESTful protegido respondendo com status HTTP 201 Created.

**Blocked by:** 01: Padronização Global de Respostas de Erro, 02: Autenticação Global por API Key

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Entidade de domínio pura `Task` com construtor que valida as invariantes de negócio:
  - `title` obrigatório, não vazio e com tamanho entre 3 e 100 caracteres.
  - `description` opcional com tamanho de até 2000 caracteres.
  - `status` padrão `PENDING` quando omitido, aceitando apenas `PENDING`, `IN_PROGRESS` ou `DONE`.
  - Geração de UUID v4 imutável e timestamps `createdAt` e `updatedAt`.
  - 100% de cobertura de branches nos testes unitários do modelo de domínio.
- [ ] Contrato de porta `TaskRepository` declarado como classe abstrata do TypeScript contendo método `create(task: Task): Promise<Task>`.
- [ ] Schema da tabela `tasks` no Drizzle ORM com colunas `id`, `title`, `description`, `status`, `created_at`, `updated_at`, `deleted_at` e arquivo de migração.
- [ ] Repositório concreto implementando a persistência com Drizzle e configurado no módulo do NestJS via injeção por classe abstrata.
- [ ] Caso de uso `CreateTaskUseCase` que instancia a entidade, persiste no repositório e propaga falhas de forma limpa.
- [ ] Controlador com rota `POST /tasks` validando o DTO de entrada via `class-validator` e respondendo HTTP 201 com os dados da tarefa criada.
- [ ] Testes de integração/E2E cobrindo sucesso com dados mínimos, sucesso com dados completos e falhas de validação de título e status (HTTP 400).
