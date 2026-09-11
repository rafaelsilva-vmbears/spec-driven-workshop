## Purpose

Fornece a especificação formal dos contratos da API REST para gerenciamento de tarefas (Task Management MVP), incluindo autenticação via API Key, tratamento padronizado de erros e operações CRUD completas.

## ADDED Requirements

### Requirement: Autenticação obrigatória via API Key
The system SHALL require a valid API key in the `x-api-key` request header for all `/tasks` endpoints. If the header is missing, the system SHALL respond with HTTP 401 Unauthorized. If the key is invalid, the system SHALL respond with HTTP 401 Unauthorized.

#### Scenario: Requisição sem header x-api-key
- **WHEN** cliente envia requisição para `/tasks` sem o header `x-api-key`
- **THEN** sistema retorna HTTP 401 com `ErrorResponse` indicando credencial ausente

#### Scenario: Requisição com chave inválida
- **WHEN** cliente envia requisição para `/tasks` com valor incorreto no header `x-api-key`
- **THEN** sistema retorna HTTP 401 com `ErrorResponse` indicando credencial inválida

#### Scenario: Requisição com chave válida
- **WHEN** cliente envia requisição para `/tasks` com header `x-api-key` correspondente à chave configurada
- **THEN** sistema autoriza o processamento normal da requisição

### Requirement: Padronização de respostas de erro
The system SHALL format all 4xx and 5xx error responses using the `ErrorResponse` schema containing `code` (string), `message` (string), and optional `details` (object).

#### Scenario: Retorno de erro estruturado
- **WHEN** uma requisição resulta em erro de validação ou erro de negócio
- **THEN** sistema retorna payload JSON contendo os campos obrigatórios `code` e `message` e opcionalmente `details`

### Requirement: Criação de tarefa
The system SHALL expose `POST /tasks` to create a new task. The request body MUST contain `title` (3 to 100 characters). The request body MAY contain `description` (up to 2000 characters) and `status` (`PENDING`, `IN_PROGRESS`, `DONE`, default `PENDING`). The system SHALL respond with HTTP 201 Created and the created task payload containing `id` (UUID), `title`, `description`, `status`, `createdAt` and `updatedAt`.

#### Scenario: Criação de tarefa com sucesso
- **WHEN** cliente autenticado envia `POST /tasks` com `title` válido e `status` omitido
- **THEN** sistema cria a tarefa com status `PENDING`, gera UUID e timestamps, e retorna HTTP 201 com os dados da tarefa

#### Scenario: Criação com dados inválidos
- **WHEN** cliente autenticado envia `POST /tasks` com `title` menor que 3 caracteres ou status desconhecido
- **THEN** sistema rejeita a requisição com HTTP 400 e `ErrorResponse` com código `VALIDATION_ERROR`

### Requirement: Consulta de tarefa por ID
The system SHALL expose `GET /tasks/{id}`. The parameter `id` MUST be a valid UUID. The system SHALL return HTTP 200 with the task data if found and not soft-deleted. If the task is not found or has been soft-deleted, the system SHALL return HTTP 404 with `ErrorResponse` (`TASK_NOT_FOUND`). If `id` is not a valid UUID format, the system SHALL return HTTP 400.

#### Scenario: Consulta de tarefa existente
- **WHEN** cliente autenticado envia `GET /tasks/{id}` para um UUID existente e ativo
- **THEN** sistema retorna HTTP 200 com os dados completos da tarefa

#### Scenario: Consulta de tarefa inexistente
- **WHEN** cliente autenticado envia `GET /tasks/{id}` para um UUID não cadastrado
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`

#### Scenario: Consulta com ID inválido
- **WHEN** cliente autenticado envia `GET /tasks/{id}` com parâmetro que não é UUID válido
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`

### Requirement: Listagem paginada de tarefas
The system SHALL expose `GET /tasks` with query parameters `page` (integer, 0-based, default 0) and `pageSize` (integer, default 10, max 100). The system SHALL return HTTP 200 with `items` (array of active tasks), `total` (count of non-deleted tasks), `page`, and `pageSize`.

#### Scenario: Listagem com paginação padrão
- **WHEN** cliente autenticado envia `GET /tasks` sem query parameters
- **THEN** sistema retorna HTTP 200 com itens da página 0, tamanho 10 e total de tarefas ativas

#### Scenario: Parâmetros de paginação inválidos
- **WHEN** cliente autenticado envia `GET /tasks` com `page` negativo ou `pageSize` maior que 100
- **THEN** sistema retorna HTTP 400 com `ErrorResponse` e código `VALIDATION_ERROR`

### Requirement: Atualização parcial de tarefa
The system SHALL expose `PATCH /tasks/{id}` to update `title`, `description`, or `status`. Fields not provided in the request body MUST remain unchanged. The system SHALL return HTTP 200 with the updated task and updated `updatedAt`. If the task does not exist or is soft-deleted, the system SHALL return HTTP 404 (`TASK_NOT_FOUND`).

#### Scenario: Atualização parcial bem-sucedida
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` com novo `status` válido
- **THEN** sistema atualiza o status, renova o timestamp `updatedAt` mantendo os demais campos, e retorna HTTP 200

#### Scenario: Atualização de tarefa inexistente
- **WHEN** cliente autenticado envia `PATCH /tasks/{id}` para um UUID não cadastrado ou removido
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`

### Requirement: Remoção de tarefa via soft delete
The system SHALL expose `DELETE /tasks/{id}`. The system SHALL mark the task as deleted (soft delete via `deletedAt`). The system SHALL return HTTP 204 No Content on success. Subsequent GET or PATCH requests for this task SHALL return HTTP 404. If the task does not exist, the system SHALL return HTTP 404.

#### Scenario: Remoção bem-sucedida de tarefa
- **WHEN** cliente autenticado envia `DELETE /tasks/{id}` para uma tarefa ativa
- **THEN** sistema marca o registro com timestamp de remoção e retorna HTTP 204 sem corpo

#### Scenario: Remoção de tarefa inexistente
- **WHEN** cliente autenticado envia `DELETE /tasks/{id}` para um UUID não cadastrado ou já removido
- **THEN** sistema retorna HTTP 404 com `ErrorResponse` e código `TASK_NOT_FOUND`
