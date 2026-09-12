## 1. Domínio e Invariantes da Tarefa

- [x] 1.1 Criar a entidade rica `Task` e o tipo/enum `TaskStatus` em `src/domain/model/task.model.ts`, encapsulando validações de invariantes no construtor ou método de fábrica (rejeitando títulos menores que 3 ou maiores que 100 caracteres, descrições superiores a 2000 caracteres e status inválidos com `DomainException`). Verificar compilação com `pnpm.cmd run build`.
- [x] 1.2 Criar suíte de testes unitários em `src/domain/model/task.model.spec.ts` cobrindo 100% das invariantes de domínio (criação válida com status padrão `PENDING`, criação com status explícito, erro de título curto, erro de título longo, erro de descrição excedendo 2000 caracteres e erro de status inválido). Executar e validar com `pnpm.cmd test`.

## 2. Porta do Repositório e Caso de Uso (DIP)

- [x] 2.1 Criar a classe abstrata `TaskRepository` em `src/domain/port/repositories/task.repository.ts` com o contrato dos métodos de persistência (`create`, `findById`, `findAll`, `update`, `delete`). Verificar exportação e compilação do arquivo.
- [x] 2.2 Implementar o caso de uso `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.ts` injetando `TaskRepository` via construtor e coordenando criação e persistência da entidade `Task`. Verificar compilação com `pnpm.cmd run build`.
- [x] 2.3 Criar testes unitários para `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.spec.ts` cobrindo execução bem-sucedida, propagação de falha do repositório e bloqueio de dados inválidos antes da camada de persistência. Executar e validar com `pnpm.cmd test`.

## 3. Persistência com Drizzle ORM

- [x] 3.1 Definir o schema da tabela `tasks` no Drizzle ORM em `src/adapters/database/drizzle/schema.ts` com colunas `id` (uuid), `title` (varchar 100), `description` (varchar 2000), `status` (varchar 20 default PENDING), `createdAt`, `updatedAt` e `deletedAt`. Verificar compilação com `pnpm.cmd run build`.
- [x] 3.2 Implementar o adaptador de persistência `TaskRepositoryImpl` em `src/adapters/database/drizzle/repositories/task.repository.impl.ts` implementando `TaskRepository` e injetando o client `DRIZZLE`. Verificar compilação com `pnpm.cmd run build`.

## 4. Camada de API, Módulo e Validação Global

- [x] 4.1 Atualizar `src/adapters/api/controllers/tasks.controller.ts` para injetar `CreateTaskUseCase`, delegar o payload de `POST /tasks` e retornar o `TaskResponseDto` mapeado.
- [x] 4.2 Criar `TasksModule` em `src/adapters/api/tasks/tasks.module.ts` configurando o provider `{ provide: TaskRepository, useClass: TaskRepositoryImpl }`, o provider `CreateTaskUseCase` e o `TasksController`, registrando o módulo no `src/app.module.ts`. Verificar compilação com `pnpm.cmd run build`.
- [x] 4.3 Atualizar os testes unitários do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` validando a chamada do caso de uso e retorno do `TaskResponseDto` na criação de tarefas. Executar e validar com `pnpm.cmd test`.
- [x] 4.4 Executar validação de conformidade e integridade completa com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo zero erros de linter e aprovação de toda a suíte de testes.
