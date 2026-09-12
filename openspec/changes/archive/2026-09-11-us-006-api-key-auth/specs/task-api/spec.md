## MODIFIED Requirements

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
