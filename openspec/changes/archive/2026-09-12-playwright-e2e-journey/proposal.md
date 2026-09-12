## Why

Completar a pirâmide de testes do projeto implementando testes de jornada ponta a ponta (E2E) black-box com Playwright. Enquanto os testes unitários validam lógica de domínio e use cases isolados, os testes de jornada executam sobre HTTP real e banco de dados real, exercitando todo o ciclo de vida de tarefas e validando a aderência fiel aos contratos definidos na especificação OpenAPI e `task-api`.

## What Changes

- Instalar `@playwright/test` como dependência de desenvolvimento focada em API testing (sem dependência de navegadores pesados).
- Criar a configuração `playwright.config.ts` apontando para a pasta `./tests/playwright`, configurando `baseURL`, headers padrão (`Content-Type: application/json`) e configurações de execução.
- Adicionar scripts no `package.json`: `"test:pw": "playwright test"` e `"test:pw:report": "playwright show-report"`.
- Implementar suíte de jornada em `tests/playwright/tasks-api.spec.ts` validando:
  1. Criação de tarefa com sucesso (`POST /tasks` → 201)
  2. Consulta de tarefa por ID (`GET /tasks/{id}` → 200)
  3. Atualização parcial de status (`PATCH /tasks/{id}` → 200)
  4. Listagem paginada contendo a tarefa criada (`GET /tasks` → 200)
  5. Remoção lógica de tarefa via soft delete (`DELETE /tasks/{id}` → 204)
  6. Confirmação de que tarefa excluída retorna 404 (`GET /tasks/{id}` → 404)
  7. Validação de segurança global sem header `x-api-key` (`GET /tasks` → 401)
  8. Validação sintática de UUID inválido (`GET /tasks/uuid-invalido` → 400 com `VALIDATION_ERROR`)

## Capabilities

### New Capabilities
<!-- Nenhuma nova capacidade -->

### Modified Capabilities
<!-- Nenhuma capacidade alterada (enabler técnico com skip_specs: true) -->

## Impact

- **Dependências**: Adição de `@playwright/test` nas `devDependencies` do `package.json`.
- **Scripts**: Novos scripts `test:pw` e `test:pw:report` em `package.json`.
- **Configuração**: Novo arquivo `playwright.config.ts`.
- **Testes**: Novo arquivo `tests/playwright/tasks-api.spec.ts`.
