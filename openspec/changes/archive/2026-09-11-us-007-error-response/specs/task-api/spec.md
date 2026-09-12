## MODIFIED Requirements

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
