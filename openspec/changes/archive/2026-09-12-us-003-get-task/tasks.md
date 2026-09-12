## 1. Exceção de Domínio TaskNotFoundException

- [x] 1.1 Criar a exceção de domínio `TaskNotFoundException` em `src/domain/exception/task-not-found.exception.ts` estendendo `DomainException` com `errorCode: 'TASK_NOT_FOUND'`, `statusCode: 404`, mensagem descritiva e detalhes com `taskId`, reexportando em `src/domain/exception/index.ts`. Verificar compilação com `pnpm.cmd run build`.
- [x] 1.2 Criar testes unitários para `TaskNotFoundException` em `src/domain/exception/task-not-found.exception.spec.ts` validando status 404, código `TASK_NOT_FOUND` e estrutura de detalhes. Executar e validar com `pnpm.cmd test`.

## 2. Caso de Uso GetTaskByIdUseCase

- [x] 2.1 Implementar o caso de uso `GetTaskByIdUseCase` em `src/domain/usecase/get-task-by-id.usecase.ts` injetando `TaskRepository`, buscando a tarefa por ID e disparando `TaskNotFoundException` quando não encontrada. Reexportar em `src/domain/usecase/index.ts` e verificar compilação com `pnpm.cmd run build`.
- [x] 2.2 Criar testes unitários para `GetTaskByIdUseCase` em `src/domain/usecase/get-task-by-id.usecase.spec.ts` cobrindo retorno com sucesso de tarefa ativa e lançamento de `TaskNotFoundException` para ID inexistente ou deletado. Executar e validar com `pnpm.cmd test`.

## 3. Integração na API, Módulo e Validação Global

- [x] 3.1 Atualizar o endpoint `GET /tasks/:id` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`) injetando `GetTaskByIdUseCase`, aplicando `new ParseUUIDPipe({ version: '4' })` e retornando `TaskResponseDto` formatado.
- [x] 3.2 Registrar e exportar `GetTaskByIdUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`). Verificar compilação com `pnpm.cmd run build`.
- [x] 3.3 Atualizar os testes unitários do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` cobrindo o método `getById` com sucesso e propagação de `TaskNotFoundException`. Executar e validar com `pnpm.cmd test`.
- [x] 3.4 Executar validação de conformidade e integridade completa com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo zero erros de linter e aprovação de toda a suíte de testes.
