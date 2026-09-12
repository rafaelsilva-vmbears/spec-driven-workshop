# 07: Fatia Vertical de Remoção Lógica (DELETE /tasks/:id)

**What to build:** A capacidade ponta a ponta de excluir logicamente (*soft delete*) uma tarefa do sistema através do endpoint `DELETE /tasks/:id`. Em vez de remover o registro físico do banco de dados, a exclusão preenche a coluna `deleted_at` com o timestamp atual. A resposta HTTP de sucesso é 204 No Content. Tarefas já excluídas ou inexistentes não podem ser excluídas novamente e abortam o fluxo com HTTP 404 Not Found, garantindo interrupção estrita de efeitos colaterais.

**Blocked by:** 04: Fatia Vertical de Consulta de Tarefa por ID (GET /tasks/:id)

**Status:** completed

## Acceptance Criteria

- [x] Método de domínio `task.delete()` na entidade `Task` que preenche `deletedAt = new Date()`. Se a tarefa já possuir `deletedAt` preenchido, o método lança exceção impedindo exclusão duplicada.
- [x] Extensão do `TaskRepository` com o método abstrato `delete(id: string): Promise<void>` (atualizando `deleted_at = now()` no Drizzle).
- [x] Caso de uso `DeleteTaskUseCase` que busca a tarefa, valida sua existência/estado ativo, aciona o método de domínio e comita a exclusão lógica no repositório.
- [x] Rota `DELETE /tasks/:id` respondendo HTTP 204 No Content sem corpo.
- [x] Testes de integração/E2E cobrindo:
  - Exclusão com sucesso de tarefa ativa (HTTP 204).
  - Confirmação de que a tarefa excluída não é mais retornada em `GET /tasks/:id` (HTTP 404) nem aparece na listagem `GET /tasks`.
  - Tentativa de exclusão repetida da mesma tarefa (HTTP 404 imediato sem nova escrita).
  - Tentativa de exclusão de tarefa com ID inexistente (HTTP 404) ou UUID inválido (HTTP 400).

