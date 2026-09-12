## Context

Ver `proposal.md` para motivação. O projeto já conta com 64 testes unitários isolados cobrindo entidades, regras de domínio, use cases, filters e controllers com mocks.
Para completar a pirâmide de testes arquitetural (conforme especificado em `docs/workshop/README.md`), introduzimos os testes de jornada de ponta a ponta (E2E) com Playwright sobre chamadas HTTP e persistência real.

## Goals / Non-Goals

**Goals:**
- Instalar e configurar `@playwright/test` focado exclusivamente em API testing, sem baixar navegadores desnecessários.
- Criar `playwright.config.ts` apontando para o diretório `tests/playwright`, com `baseURL` configurável via `API_BASE_URL` (default `http://localhost:3000`), timeout adequado e headers padrão JSON.
- Adicionar os scripts de execução `test:pw` e `test:pw:report` em `package.json`.
- Criar a suíte `tests/playwright/tasks-api.spec.ts` validando a jornada completa de tarefas:
  1. `POST /tasks` com chave de autenticação → 201 Created
  2. `GET /tasks/{id}` → 200 OK
  3. `PATCH /tasks/{id}` atualizando status → 200 OK
  4. `GET /tasks` confirmando presença na listagem paginada → 200 OK
  5. `DELETE /tasks/{id}` marcando como soft delete → 204 No Content
  6. `GET /tasks/{id}` da tarefa deletada → 404 Not Found (`TASK_NOT_FOUND`)
  7. `GET /tasks` sem header `x-api-key` → 401 Unauthorized
  8. `GET /tasks/uuid-invalido` → 400 Bad Request (`VALIDATION_ERROR`)

**Non-Goals:**
- Testes de interface gráfica ou renderização de browsers (UI testing).
- Alteração em schemas, banco de dados ou endpoints da API.

## Decisions

### Decisão 1: Playwright Test como API Testing Client
- **Escolha**: Utilizar `@playwright/test` aproveitando o fixture embutido `request` (`APIRequestContext`), que oferece asserções nativas especializadas para respostas HTTP, relatórios visuais e compatibilidade com CI/CD.
- **Alternativa considerada**: `supertest` ou `axios` manuais. *Rejeitada*: Conforme o guia do workshop, Playwright padroniza a camada de topo da pirâmide com black-box testing enterprise e relatórios desacoplados.

### Decisão 2: Configuração de Conexão e API Key
- **Escolha**: Obter a `API_KEY` da variável de ambiente (com fallback para `secret-workshop-api-key` conforme configurado no template) e `baseURL` de `process.env.API_BASE_URL || 'http://localhost:3000'`.

## Risks / Trade-offs

- **[Risco] Execução do teste falhar caso a API não esteja rodando** → **Mitigação**: `playwright.config.ts` configura `webServer` opcional com timeout de 30s ou reaproveitamento de servidor existente (`reuseExistingServer: true`), permitindo rodar com a aplicação iniciada previamente (`pnpm start:dev`) ou sob demanda.
