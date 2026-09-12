# 02: Autenticação Global por API Key (ApiKeyGuard)

**What to build:** Um mecanismo de segurança global *Secure by Default* que intercepta todas as requisições HTTP da API exigindo o envio do header `x-api-key`. Requisições sem a chave ou com chave divergente da configurada no ambiente recebem HTTP 401 Unauthorized com o contrato `ErrorResponse`. Rotas públicas essenciais (como documentação e health check) devem poder ignorar a checagem via anotação explícita.

**Blocked by:** 01: Padronização Global de Respostas de Erro (ErrorResponse)

**Status:** completed

## Acceptance Criteria

- [x] Implementar guard global registrado na raiz da aplicação que inspeciona o header `x-api-key` contra o valor definido na variável de ambiente `API_KEY`.
- [x] Requisições com header ausente ou chave inválida devem ser barradas com status HTTP 401 e payload `ErrorResponse` contendo o código `UNAUTHORIZED`.
- [x] Criar decorator explícito `@Public()` para liberar endpoints de infraestrutura e documentação sem exigir o header.
- [x] Configuração segura no `.env.example` com chave padrão de desenvolvimento.
- [x] Testes unitários do guard cobrindo:
  - Requisição sem header `x-api-key` (deve rejeitar com 401).
  - Requisição com chave inválida (deve rejeitar com 401).
  - Requisição com chave válida (deve autorizar com sucesso).
  - Rota anotada com `@Public()` mesmo sem chave (deve autorizar com sucesso).
