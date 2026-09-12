## 1. Modelo Rico de Domínio e DTO

- [x] 1.1 Implementar o método `update(props: UpdateTaskProps): boolean` na entidade `Task` (`src/domain/model/task.model.ts`) tratando a semântica de `undefined` vs `null`, validação de invariantes e atualização de `_updatedAt`. Atualizar `UpdateTaskDto` (`src/adapters/api/dto/update-task.dto.ts`) para suportar `description?: string | null`. Verificar compilação com `pnpm.cmd run build`.
- [x] 1.2 Atualizar os testes unitários de `Task` em `src/domain/model/task.model.spec.ts` cobrindo mutação de título, status, limpeza de descrição com `null`, rejeição de invariantes inválidas e verificação de retorno `false` (no-op) quando nenhum valor muda. Executar e validar com `pnpm.cmd test`.

## 2. Caso de Uso UpdateTaskUseCase

- [x] 2.1 Implementar o caso de uso `UpdateTaskUseCase` em `src/domain/usecase/update-task.usecase.ts` injetando `TaskRepository`, buscando a tarefa por ID, disparando `TaskNotFoundException` quando inexistente ou soft-deleted, aplicando `task.update()` e persistindo apenas se houver modificação (no-op bypass). Reexportar em `src/domain/usecase/index.ts` e verificar compilação com `pnpm.cmd run build`.
- [x] 2.2 Criar testes unitários para `UpdateTaskUseCase` em `src/domain/usecase/update-task.usecase.spec.ts` validando atualização bem-sucedida, no-op sem chamada ao repositório, e lançamento de `TaskNotFoundException` para ID inexistente ou deletado. Executar e validar com `pnpm.cmd test`.

## 3. Integração na API, Módulo e Validação Global

- [x] 3.1 Atualizar o endpoint `PATCH /tasks/:id` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`) injetando `UpdateTaskUseCase`, aplicando `new ParseUUIDPipe({ version: '4' })` e retornando `TaskResponseDto`.
- [x] 3.2 Registrar e exportar `UpdateTaskUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`). Verificar compilação com `pnpm.cmd run build`.
- [x] 3.3 Atualizar os testes unitários do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` cobrindo o método `update` com sucesso e propagação de `TaskNotFoundException`. Executar e validar com `pnpm.cmd test`.
- [x] 3.4 Executar validação de conformidade e integridade completa com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo zero erros de linter e aprovação de toda a suíte de testes.
