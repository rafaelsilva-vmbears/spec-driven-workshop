## MODIFIED Requirements

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
