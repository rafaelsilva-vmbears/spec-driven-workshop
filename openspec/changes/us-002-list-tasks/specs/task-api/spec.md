## MODIFIED Requirements

### Requirement: Listagem paginada de tarefas
The system SHALL expose `GET /tasks` with query parameters `page` (integer, 0-based, default 0) and `pageSize` (integer, default 10, max 100). The system SHALL return HTTP 200 with `items` (array of active tasks), `total` (count of non-deleted tasks), `page`, and `pageSize`. If `page` is negative or `pageSize` is less than 1 or greater than 100, the system SHALL return HTTP 400 with `ErrorResponse` (`VALIDATION_ERROR`). The system SHALL exclude soft-deleted tasks from both `items` and `total`.

#### Scenario: Listagem com paginação padrão
- **WHEN** cliente autenticado envia `GET /tasks` sem query parameters
- **THEN** sistema retorna HTTP 200 com itens da página 0, tamanho 10 e total de tarefas ativas não deletadas

#### Scenario: Listagem com parâmetros customizados
- **WHEN** cliente autenticado envia `GET /tasks` com parâmetros válidos como `page=1` e `pageSize=5`
- **THEN** sistema retorna HTTP 200 com os itens da página 1, tamanho 5 e total de tarefas ativas

#### Scenario: Listagem quando não há tarefas ativas
- **WHEN** cliente autenticado envia `GET /tasks` e não existem tarefas ou todas foram removidas via soft delete
- **THEN** sistema retorna HTTP 200 com `items` vazio, `total` igual a 0, mantendo `page` e `pageSize` solicitados

#### Scenario: Parâmetros de paginação inválidos
- **WHEN** cliente autenticado envia `GET /tasks` com `page` negativo, `pageSize` menor que 1 ou `pageSize` maior que 100
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`
