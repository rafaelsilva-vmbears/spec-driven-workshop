## 1. Setup e Configuração do Playwright

- [x] 1.1 Instalar a dependência `@playwright/test` como devDependency via `pnpm.cmd add -D @playwright/test` e verificar integridade do `package.json`.
- [x] 1.2 Criar o arquivo `playwright.config.ts` na raiz do projeto definindo `testDir: './tests/playwright'`, `baseURL` dinâmica, headers JSON e configuração de `webServer`.
- [x] 1.3 Adicionar os scripts `"test:pw": "playwright test"` e `"test:pw:report": "playwright show-report"` no `package.json`.

## 2. Implementação da Suíte de Jornada E2E

- [x] 2.1 Criar o arquivo de teste `tests/playwright/tasks-api.spec.ts` cobrindo o ciclo de vida completo da API: criação (201), consulta (200), atualização (200), listagem (200), soft delete (204), verificação pós-exclusão (404), autenticação obrigatória (401) e validação de UUID (400).

## 3. Validação e Qualidade

- [x] 3.1 Executar a validação de linter com `pnpm.cmd run lint` e build com `pnpm.cmd run build` garantindo zero erros de tipagem e formatação.
- [x] 3.2 Executar a suíte completa de testes unitários com `pnpm.cmd test` assegurando 100% de aprovação e ausência de regressões.
