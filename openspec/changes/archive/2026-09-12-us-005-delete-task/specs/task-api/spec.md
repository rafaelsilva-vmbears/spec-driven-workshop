## MODIFIED Requirements

### Requirement: Remoção de tarefa via soft delete
The system SHALL expose `DELETE /tasks/{id}` to remove a task via soft delete (setting `deletedAt`). The parameter `id` MUST be a valid UUID. If `id` is not a valid UUID format, the system SHALL return HTTP 400 (`VALIDATION_ERROR`). The system SHALL return HTTP 204 No Content without a response body on success. If the task does not exist or has already been soft-deleted, the system SHALL return HTTP 404 with `ErrorResponse` (`TASK_NOT_FOUND`) and abort without performing side effects on the database. Subsequent requests (GET, PATCH, DELETE) for this task SHALL return HTTP 404 (`TASK_NOT_FOUND`).

#### Scenario: Remoção bem-sucedida de tarefa
- **WHEN** cliente autenticado envia `DELETE /tasks/{id}` para uma tarefa ativa existente
- **THEN** sistema marca o registro com timestamp de remoção `deletedAt`, persiste a alteração e retorna HTTP 204 sem corpo

#### Scenario: Remoção de tarefa inexistente
- **WHEN** cliente autenticado envia `DELETE /tasks/{id}` para um UUID não cadastrado ou já removido
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND` sem executar comandos de exclusão no repositório

#### Scenario: Remoção com ID inválido
- **WHEN** cliente autenticado envia `DELETE /tasks/{id}` com parâmetro que não é UUID válido
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`
