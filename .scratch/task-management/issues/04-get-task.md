# 04: Fatia Vertical de Consulta de Tarefa por ID (GET /tasks/:id)

**What to build:** A capacidade ponta a ponta de consultar os detalhes completos de uma tarefa específica a partir do seu identificador UUID v4 via endpoint `GET /tasks/:id`. Se a tarefa existir e estiver ativa, retorna seus dados com HTTP 200 OK. Se não existir ou tiver sido excluída via soft delete, retorna HTTP 404 Not Found com código semântico. Se o ID fornecido na URL for malformado, a requisição é rejeitada na borda com HTTP 400 Bad Request.

**Blocked by:** 03: Fatia Vertical de Criação de Tarefa (POST /tasks)

**Status:** done

## Acceptance Criteria

- [x] Extensão do contrato `TaskRepository` com o método abstrato `findById(id: string): Promise<Task | null>`.
- [x] Implementação da query no repositório concreto Drizzle filtrando estritamente registros onde `deleted_at IS NULL`.
- [x] Caso de uso `GetTaskUseCase` que busca a tarefa e dispara exceção de negócio `TaskNotFoundException` quando o resultado for nulo.
- [x] Rota `GET /tasks/:id` no controlador utilizando pipe de validação de UUID v4 para barrar identificadores inválidos.
- [x] Testes unitários do caso de uso cobrindo tarefa encontrada e tarefa não encontrada.
- [x] Testes de integração/E2E cobrindo:
  - Consulta de tarefa existente (HTTP 200).
  - Consulta com UUID inexistente (HTTP 404 com `TASK_NOT_FOUND`).
  - Consulta com identificador fora do padrão UUID (HTTP 400).
