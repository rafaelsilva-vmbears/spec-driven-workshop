# task-api Specification

## Purpose
Fornece a especificação formal dos contratos da API REST para gerenciamento de tarefas (Task Management MVP), incluindo autenticação via API Key, tratamento padronizado de erros e operações CRUD completas.

## Requirements

### Requirement: Autenticação obrigatória via API Key
The system SHALL require a valid API key in the `x-api-key` request header for all protected endpoints by default (Secure by Default). If the header is missing, the system SHALL respond with HTTP 401 Unauthorized. If the key is invalid, the system SHALL respond with HTTP 401 Unauthorized. Endpoints or routes explicitly decorated with `@Public()` SHALL bypass API key validation and allow unauthenticated access.

#### Scenario: Requisição sem header x-api-key
- **WHEN** cliente envia requisição para `/tasks` sem o header `x-api-key`
- **THEN** sistema retorna HTTP 401 com `ErrorResponse` indicando credencial ausente

#### Scenario: Requisição com chave inválida
- **WHEN** cliente envia requisição para `/tasks` com valor incorreto no header `x-api-key`
- **THEN** sistema retorna HTTP 401 com `ErrorResponse` indicando credencial inválida

#### Scenario: Requisição com chave válida
- **WHEN** cliente envia requisição para `/tasks` com header `x-api-key` correspondente à chave configurada
- **THEN** sistema autoriza o processamento normal da requisição

#### Scenario: Acesso a rota pública
- **WHEN** cliente envia requisição para uma rota marcada com o decorator `@Public()` sem header `x-api-key`
- **THEN** sistema libera a execução da rota sem exigir autenticação

### Requirement: Padronização de respostas de erro
The system SHALL format all 4xx and 5xx error responses using the `ErrorResponse` schema containing `code` (string), `message` (string), and optional `details` (object). The system SHALL map domain exceptions to specific error codes and corresponding HTTP status codes. The system SHALL map validation failures to HTTP 400 with code `VALIDATION_ERROR`. The system SHALL catch unhandled exceptions, log them with structured logging, and respond with HTTP 500 with code `INTERNAL_SERVER_ERROR`.

#### Scenario: Retorno de erro estruturado
- **WHEN** uma requisição resulta em erro de validação ou erro de negócio
- **THEN** sistema retorna payload JSON contendo os campos obrigatórios `code` e `message` e opcionalmente `details`

#### Scenario: Mapeamento de exceção de domínio
- **WHEN** uma operação de domínio dispara uma exceção com código de erro específico
- **THEN** sistema intercepta e retorna o código HTTP correspondente com payload `ErrorResponse` contendo o código de erro e mensagem descritiva

#### Scenario: Erro de validação de entrada
- **WHEN** o corpo ou parâmetros da requisição violam regras de validação sintática ou de schema
- **THEN** sistema retorna HTTP 400 com `ErrorResponse`, código `VALIDATION_ERROR` e detalhes das violações

#### Scenario: Exceção não tratada
- **WHEN** ocorre uma falha inesperada ou exceção não tratada pelo sistema
- **THEN** sistema registra o erro com log estruturado e responde com HTTP 500 contendo código `INTERNAL_SERVER_ERROR` sem vazar detalhes internos

### Requirement: Criação de tarefa
The system SHALL expose `POST /tasks` to create a new task. The request body MUST contain `title` (3 to 100 characters). The request body MAY contain `description` (up to 2000 characters) and `status` (`PENDING`, `IN_PROGRESS`, `DONE`, default `PENDING`). The system SHALL respond with HTTP 201 Created and the created task payload containing `id` (UUID), `title`, `description`, `status`, `createdAt` and `updatedAt`.

#### Scenario: Criação de tarefa com sucesso
- **WHEN** cliente autenticado envia `POST /tasks` com `title` válido e `status` omitido
- **THEN** sistema cria a tarefa com status `PENDING`, gera UUID e timestamps, e retorna HTTP 201 com os dados da tarefa

#### Scenario: Criação com status explícito
- **WHEN** cliente autenticado envia `POST /tasks` com `title` válido e `status` explícito como `IN_PROGRESS`
- **THEN** sistema cria a tarefa com o status especificado e retorna HTTP 201

#### Scenario: Criação com dados inválidos
- **WHEN** cliente autenticado envia `POST /tasks` com `title` menor que 3 caracteres, maior que 100 caracteres ou status desconhecido
- **THEN** sistema rejeita a requisição com HTTP 400 e `ErrorResponse` com código `VALIDATION_ERROR`

#### Scenario: Criação com descrição excedendo limite
- **WHEN** cliente autenticado envia `POST /tasks` com `description` superior a 2000 caracteres
- **THEN** sistema rejeita a requisição com HTTP 400 e `ErrorResponse` com código `VALIDATION_ERROR`

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

