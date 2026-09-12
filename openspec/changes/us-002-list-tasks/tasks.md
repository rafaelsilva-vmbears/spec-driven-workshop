## 1. DTO de Entrada ListTasksQueryDto

- [ ] 1.1 Criar o DTO `ListTasksQueryDto` em `src/adapters/api/dto/list-tasks-query.dto.ts` com propriedades `page` (`@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(0)`) e `pageSize` (`@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(100)`), reexportando em `src/adapters/api/dto/index.ts`. Verificar compilação com `pnpm.cmd run build`.
- [ ] 1.2 Criar testes unitários para `ListTasksQueryDto` em `src/adapters/api/dto/list-tasks-query.dto.spec.ts` validando aceitação de valores válidos, coerção de string numérica e rejeição de valores inválidos (negativos, pageSize menor que 1 ou maior que 100). Executar e validar com `pnpm.cmd test`.

## 2. Caso de Uso ListTasksUseCase

- [ ] 2.1 Implementar o caso de uso `ListTasksUseCase` em `src/domain/usecase/list-tasks.usecase.ts` injetando `TaskRepository`, aplicando defaults defensivos (`page: 0`, `pageSize: 10`) e invocando `this.taskRepository.findAll(...)`. Reexportar em `src/domain/usecase/index.ts` e verificar compilação com `pnpm.cmd run build`.
- [ ] 2.2 Criar testes unitários para `ListTasksUseCase` em `src/domain/usecase/list-tasks.usecase.spec.ts` validando aplicação dos defaults quando omitidos, repasse de parâmetros customizados e propagação de erros do repositório. Executar e validar com `pnpm.cmd test`.

## 3. Integração na API, Módulo e Validação Global

- [ ] 3.1 Atualizar o endpoint `GET /tasks` no `TasksController` (`src/adapters/api/controllers/tasks.controller.ts`) injetando `ListTasksUseCase`, recebendo `@Query() query: ListTasksQueryDto` e retornando `PaginatedTasksResponseDto` com itens mapeados para `TaskResponseDto`.
- [ ] 3.2 Registrar e exportar `ListTasksUseCase` no `TasksModule` (`src/adapters/api/tasks/tasks.module.ts`). Verificar compilação com `pnpm.cmd run build`.
- [ ] 3.3 Atualizar os testes unitários do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` cobrindo o método `list` com parâmetros padrão, customizados e mapeamento correto da saída `PaginatedTasksResponseDto`. Executar e validar com `pnpm.cmd test`.
- [ ] 3.4 Executar validação de conformidade e integridade completa com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo zero erros de linter e aprovação de toda a suíte de testes.
