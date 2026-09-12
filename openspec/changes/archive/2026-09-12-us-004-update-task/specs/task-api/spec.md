## MODIFIED Requirements

### Requirement: Atualização parcial de tarefa
The system SHALL expose `PATCH /tasks/{id}` to update `title`, `description`, or `status`. The parameter `id` MUST be a valid UUID. Fields not provided in the request body (undefined) MUST remain unchanged. If `description` is explicitly provided as `null`, the system SHALL clear the description. If no fields are changed (no-op), the system SHALL return HTTP 200 without executing database update queries. If any updated field violates validation rules (such as `title` length or invalid `status`), the system SHALL return HTTP 400 (`VALIDATION_ERROR`). The system SHALL return HTTP 200 with the updated task and updated `updatedAt`. If the task does not exist or is soft-deleted, the system SHALL return HTTP 404 with `ErrorResponse` (`TASK_NOT_FOUND`).

#### Scenario: Atualização parcial bem-sucedida
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com novo `status` válido
- **THEN** sistema atualiza o status, renova o timestamp `updatedAt` mantendo os demais campos, e retorna HTTP 200

#### Scenario: Atualização de múltiplos campos e limpeza de descrição
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com novo `title` e `description` como `null`
- **THEN** sistema atualiza o título, define description como `null`, renova `updatedAt` e retorna HTTP 200

#### Scenario: Atualização sem alterações (no-op)
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com payload vazio ou valores idênticos aos atuais
- **THEN** sistema retorna HTTP 200 com os dados atuais sem modificar `updatedAt` nem disparar query de atualização no banco de dados

#### Scenario: Atualização de tarefa inexistente
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` para um UUID não cadastrado ou removido
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`

#### Scenario: Atualização com ID inválido
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com parâmetro que não é UUID válido
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`

#### Scenario: Atualização com dados inválidos
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com `title` menor que 3 caracteres, maior que 100 caracteres ou status desconhecido
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`
