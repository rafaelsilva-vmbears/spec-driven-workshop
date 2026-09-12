## Context

Consulte `proposal.md` para motivação e `specs/task-api/spec.md` para contratos de comportamento.
A base da aplicação já conta com Clean Architecture estruturada:
- A entidade de domínio rica `Task` (`src/domain/model/task.model.ts`) encapsula atributos privados e valida invariantes no construtor, mas atualmente não expõe método para atualização parcial controlada.
- O contrato de repositório `TaskRepository` (`src/domain/port/repositories/task.repository.ts`) já define `abstract update(task: Task): Promise<Task>`.
- A implementação Drizzle `TaskRepositoryImpl` (`src/adapters/database/drizzle/repositories/task.repository.impl.ts`) já implementa o método `update` com cláusula de proteção a soft delete (`and(eq(tasks.id, task.id), isNull(tasks.deletedAt))`).
- O DTO `UpdateTaskDto` já existe em `src/adapters/api/dto/update-task.dto.ts`, mas requer suporte a `null` na descrição para viabilizar sua limpeza.
- O endpoint `PATCH /tasks/:id` no `TasksController` é atualmente um stub não implementado.

## Goals / Non-Goals

**Goals:**
- Implementar o método `update(props: UpdateTaskProps): boolean` na entidade `Task`, revalidando invariantes (título entre 3 e 100 caracteres, descrição até 2000 caracteres, status enum válido) e atualizando `_updatedAt` somente se houver mutação efetiva.
- Tratar a semântica semântica de `undefined` (manter valor atual) vs `null` (limpar a descrição opcional).
- Implementar o caso de uso `UpdateTaskUseCase` em `src/domain/usecase/update-task.usecase.ts`:
  - Buscar a tarefa ativa por ID via `TaskRepository.findById`.
  - Se não for encontrada ou estiver soft-deleted, lançar `TaskNotFoundException` (HTTP 404).
  - Executar `task.update(props)`. Se for no-op (retorno `false`), retornar a tarefa imediatamente sem acionar o repositório.
  - Se houve alteração (retorno `true`), chamar `TaskRepository.update(task)` e retornar o resultado.
- Atualizar `UpdateTaskDto` para suportar `description?: string | null`.
- Atualizar o controller `TasksController.update` para aplicar `new ParseUUIDPipe({ version: '4' })` no parâmetro `id`, injetar `UpdateTaskUseCase` e mapear o retorno para `TaskResponseDto`.
- Registrar e exportar `UpdateTaskUseCase` no `TasksModule`.

**Non-Goals:**
- Alteração de identificadores ou datas de criação (`id` e `createdAt` são imutáveis).
- Exclusão ou soft-delete (escopo de US-005).
- Regras de transição de status complexas (qualquer transição entre `PENDING`, `IN_PROGRESS` e `DONE` é permitida nesta versão).

## Decisions

### Decisão 1: Método `update()` na Entidade Rica (Rich Domain Model)
- **Opção adotada**: A mutação é realizada internamente por `task.update({ title, description, status })`. A entidade valida as invariantes e retorna um booleano indicando se algum dado foi alterado.
- **Alternativa considerada**: Criar setters públicos na entidade ou clonar com novo objeto. Rejeitada para evitar modelo anêmico e manter o encapsulamento estrito das invariantes de domínio.

### Decisão 2: Semântica de null vs undefined
- **Opção adotada**:
  - `undefined`: o campo foi omitido no payload JSON e seu valor atual é preservado.
  - `null`: aplicável exclusivamente a `description`, limpando o campo para `null`.
- **Alternativa considerada**: Interpretar `null` e `undefined` de forma idêntica. Rejeitada pois impediria que o cliente apagasse uma descrição previamente cadastrada.

### Decisão 3: Otimização No-op no Use Case
- **Opção adotada**: Caso `task.update()` detecte que todos os campos informados possuem valores idênticos aos atuais (ou nenhum campo foi enviado), o método retorna `false` e o `UpdateTaskUseCase` retorna a entidade sem emitir comando `UPDATE` no PostgreSQL.
- **Alternativa considerada**: Executar sempre a query de update. Rejeitada para economizar I/O e evitar atualizações desnecessárias de timestamps quando nada mudou.

## Risks / Trade-offs

- **[Risco]** Envio de `null` para campos obrigatórios como `title` ou `status`.  
  → **Mitigação**: `UpdateTaskDto` não permite valor `null` nesses campos, e a entidade `Task` valida no domínio que `title` deve ser uma string com trim válido e `status` um enum reconhecido.
- **[Risco]** Atualização de tarefas que foram removidas via soft delete concomitantemente.  
  → **Mitigação**: O use case verifica existência inicial via `findById` e o `TaskRepositoryImpl.update` filtra `isNull(tasks.deletedAt)`, garantindo integridade.
