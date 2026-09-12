## MODIFIED Requirements

### Requirement: Consulta de tarefa por ID
The system SHALL expose `GET /tasks/{id}`. The parameter `id` MUST be a valid UUID. The system SHALL return HTTP 200 with the task data if found and not soft-deleted. If the task is not found or has been soft-deleted, the system SHALL return HTTP 404 with `ErrorResponse` (`TASK_NOT_FOUND`). If `id` is not a valid UUID format, the system SHALL return HTTP 400.

#### Scenario: Consulta de tarefa existente
- **WHEN** cliente autenticado envia `GET /tasks/{id}` para um UUID existente e ativo
- **THEN** sistema retorna HTTP 200 com os dados completos da tarefa

#### Scenario: Consulta de tarefa inexistente
- **WHEN** cliente autenticado envia `GET /tasks/{id}` para um UUID não cadastrado
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`

#### Scenario: Consulta de tarefa removida via soft delete
- **WHEN** cliente autenticado envia `GET /tasks/{id}` para um UUID de uma tarefa que foi removida (soft delete)
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`

#### Scenario: Consulta com ID inválido
- **WHEN** cliente autenticado envia `GET /tasks/{id}` com parâmetro que não é UUID válido
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`
