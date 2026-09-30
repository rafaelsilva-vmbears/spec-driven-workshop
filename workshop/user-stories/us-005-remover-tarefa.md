# US-005 – Remover tarefa

**Como** Cliente da API  
**Eu quero** remover uma tarefa  
**Para** mantê-la oculta das consultas sem perder o histórico no banco de dados.

## Critérios de Aceitação

1. Deve existir o endpoint `DELETE /tasks/:id` protegido por API Key.
2. O parâmetro `:id` deve ser validado via `new ParseUUIDPipe({ version: '4' })`.
3. A remoção é lógica ([ADR-0003](../../docs/adr/0003-remocao-logica-invisivel-com-404.md)):
   - O caso de uso carrega a tarefa por `findActiveById`, chama `task.remove()` e persiste via `TaskRepository.update(task)`.
   - `deletedAt` é preenchido com o timestamp UTC corrente. `updatedAt` **não** é alterado.
   - O registro permanece na tabela do PostgreSQL, mas fica invisível para todas as consultas da API.
4. Se a tarefa não existir ou já tiver sido removida, o caso de uso lança `TaskNotFoundException`, resultando em HTTP 404 com `code: "TASK_NOT_FOUND"`.
5. Em caso de sucesso, a API responde HTTP 204 No Content (sem corpo).

## Notas de Negócio

- A remoção lógica preserva os dados para futuras trilhas de auditoria.
- A remoção é irreversível via API neste MVP.
- Remover de novo a mesma tarefa responde 404, não 204.
