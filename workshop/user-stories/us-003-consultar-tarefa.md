# US-003 – Consultar detalhes de uma tarefa

**Como** Cliente da API  
**Eu quero** consultar os detalhes de uma tarefa específica informando seu UUID  
**Para** inspecionar seu estado e acompanhar suas informações completas.

## Critérios de Aceitação

1. Deve existir o endpoint `GET /tasks/:id` protegido por API Key (`x-api-key`).
2. O parâmetro `:id` deve ser validado na borda via `new ParseUUIDPipe({ version: '4' })`. Caso inválido, retornar HTTP 400 com `code: "VALIDATION_ERROR"`.
3. O caso de uso busca a tarefa por `TaskRepository.findActiveById(id)`, que só retorna tarefas ativas.
4. Caso a tarefa exista e esteja ativa, retornar HTTP 200 OK com:
   - `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`.
5. Caso a tarefa não exista ou tenha sido removida, o caso de uso deve lançar `TaskNotFoundException`, resultando em:
   - HTTP 404 Not Found.
   - Corpo: `{ "code": "TASK_NOT_FOUND", "message": "Task with id <id> not found" }`.

## Notas de Negócio

- A consulta é estritamente idempotente e de leitura.
- Para o Cliente da API, uma tarefa removida se comporta como se nunca tivesse existido (HTTP 404) ([ADR-0003](../../docs/adr/0003-remocao-logica-invisivel-com-404.md)).
