# US-004 – Atualizar parcialmente uma tarefa

**Como** Cliente da API  
**Eu quero** atualizar parcialmente o título, descrição ou status de uma tarefa  
**Para** refletir mudanças no planejamento ou progresso da atividade.

## Critérios de Aceitação

1. Deve existir o endpoint `PATCH /tasks/:id` protegido por API Key.
2. O parâmetro `:id` deve ser validado via `new ParseUUIDPipe({ version: '4' })`.
3. O corpo da requisição (`UpdateTaskDto`) permite campos opcionais:
   - `title`: string de 3 a 100 caracteres após `trim`. `null` não é aceito.
   - `description`: string de até 2000 caracteres após `trim`, ou `null` para limpar o campo. Vazia ou só espaços é normalizada para `null`.
   - `status`: enum válido (`PENDING`, `IN_PROGRESS`, `COMPLETED`). `null` não é aceito.
   - Qualquer outro campo resulta em HTTP 400 `VALIDATION_ERROR`.
4. **Semântica No-Op:** `task.update(changes)` retorna `boolean` indicando se algo mudou. Se não mudou (payload vazio ou com os mesmos valores atuais), o caso de uso retorna a tarefa sem chamar `TaskRepository.update` e sem alterar `updatedAt`.
5. Se houver alterações efetivas, a entidade `Task` aplica a mutação, revalida invariantes (violação → `InvalidTaskException` → 400 `VALIDATION_ERROR`) e atualiza `updatedAt` para o timestamp UTC corrente. O caso de uso então persiste via `TaskRepository.update(task)`.
6. Se a tarefa não existir ou tiver sido removida (`findActiveById` retorna vazio), o caso de uso lança `TaskNotFoundException`, retornando HTTP 404 com `code: "TASK_NOT_FOUND"`.
7. Em caso de sucesso, retornar HTTP 200 OK com os dados atualizados da tarefa.
8. Campos não fornecidos (`undefined`) permanecem inalterados.

## Notas de Negócio

- Transições de status são livres: qualquer status pode ir para qualquer outro, inclusive `PENDING` → `COMPLETED` e `COMPLETED` → `PENDING`.
- O envio de `null` no campo `description` limpa a descrição.
- Concorrência: *last-write-wins*. Não há controle otimista no MVP, e dois `PATCH` simultâneos podem sobrescrever um ao outro. Essa é uma limitação conhecida.
