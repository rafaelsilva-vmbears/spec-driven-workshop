## Context

Ver `proposal.md` para a motivação de negócio. O projeto utiliza Clean Architecture com NestJS e Drizzle ORM.
A entidade `Task` protege suas invariantes de ciclo de vida. A porta `TaskRepository` já declara `abstract delete(id: string): Promise<void>` e `findById(id: string): Promise<Task | null>`, cujo método concreto em `TaskRepositoryImpl` filtra por `isNull(tasks.deletedAt)`.
O endpoint `@Delete(':id')` no `TasksController` já está mapeado, porém possui apenas um stub temporário lançando erro de método não implementado.

## Goals / Non-Goals

**Goals:**
- Encapsular o comportamento de exclusão lógica no modelo rico com `task.delete(): void`, atualizando `_deletedAt` e `_updatedAt`, e impedindo deleção redundante de tarefa já excluída.
- Implementar o caso de uso `DeleteTaskUseCase` injetando `TaskRepository`, disparando `TaskNotFoundException` (HTTP 404) quando a tarefa não existir ou já estiver excluída, abortando sem efeitos colaterais no banco de dados.
- Conectar `DeleteTaskUseCase` ao `TasksController.delete` com validação de UUID v4 (`new ParseUUIDPipe({ version: '4' })`) e status HTTP 204 No Content.
- Registrar e exportar `DeleteTaskUseCase` no `TasksModule`.
- Garantir testes unitários abrangentes cobrindo domínio, caso de uso e controller.

**Non-Goals:**
- Hard delete (remoção física de linhas na tabela `tasks`) não é suportado no MVP.
- Endpoints de restauração (undelete) ou visualização de histórico de auditoria estão fora do escopo desta US.

## Decisions

### Decisão 1: Soft Delete no Domínio Rico (`task.delete()`)
- **Escolha**: Criar o método `delete(): void` na entidade `Task` (`src/domain/model/task.model.ts`). Ele atribui `this._deletedAt = new Date()`, `this._updatedAt = new Date()` e lança `TaskValidationException` se a tarefa já possuir `_deletedAt !== null`.
- **Alternativa considerada**: Atualizar apenas o banco diretamente via repositório. *Rejeitada*: O workshop adota Rich Domain Model; a transição de estado da entidade deve ser validada e controlada pelo próprio domínio.

### Decisão 2: Verificação de Existência e Interrupção de Efeitos Colaterais
- **Escolha**: `DeleteTaskUseCase` executa `this.taskRepository.findById(id)`. Como `findById` restringe tarefas com `isNull(tasks.deletedAt)`, qualquer tarefa inexistente ou já excluída retorna `null`. O caso de uso lança `TaskNotFoundException(id)` imediatamente, evitando qualquer comando de alteração no banco.
- **Alternativa considerada**: Executar um `update` cego no banco e checar contagem de linhas afetadas. *Rejeitada*: Viola a separação de responsabilidades e as regras de domínio de verificação e orquestração de use cases.

### Decisão 3: Validação de Parâmetro na Borda
- **Escolha**: Utilizar `@Param('id', new ParseUUIDPipe({ version: '4' }))` no controller para retorno fail-fast de HTTP 400 (`VALIDATION_ERROR`) antes de atingir o use case.

## Risks / Trade-offs

- **[Risco] Tarefas excluídas serem acidentalmente retornadas em futuras listagens ou consultas** → **Mitigação**: `TaskRepositoryImpl` já possui a cláusula `isNull(tasks.deletedAt)` em `findById`, `findAll` e `update`. Testes de integração e unitários cobrem a não visibilidade de itens excluídos.
- **[Risco] Execução de efeitos colaterais para IDs inexistentes** → **Mitigação**: Testes unitários do use case verificam explicitamente que `taskRepository.delete` nunca é invocado quando `findById` retorna `null`.
