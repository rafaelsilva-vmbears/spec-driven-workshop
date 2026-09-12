## 1. Decorator @Public

- [x] 1.1 Criar o decorator `@Public()` em `src/adapters/api/guards/public.decorator.ts` utilizando `SetMetadata` com a constante `IS_PUBLIC_KEY = 'isPublic'`. Verificar que o arquivo compila e exporta o decorator e a chave.

## 2. Implementação do ApiKeyGuard e Registro Global

- [x] 2.1 Implementar `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.ts` implementando `CanActivate`, injetando `Reflector` e `ConfigService`, checando bypass via `reflector.getAllAndOverride` e validando o header `x-api-key` contra `API_KEY` (lançando `UnauthorizedException` com `{ code: 'INVALID_API_KEY', message: 'API key is missing or invalid' }` caso ausente ou inválida). Verificar compilação com `pnpm.cmd run build`.
- [x] 2.2 Registrar o `ApiKeyGuard` como provider global no `src/app.module.ts` utilizando `{ provide: APP_GUARD, useClass: ApiKeyGuard }`. Verificar compilação do módulo e injeção do provider.

## 3. Testes Unitários e Validação

- [x] 3.1 Criar testes unitários para `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.spec.ts` cobrindo os cenários de rota pública (`@Public()`), requisição sem header `x-api-key`, requisição com chave incorreta e requisição com chave válida. Executar e validar com `pnpm.cmd test`.
- [x] 3.2 Executar validação de conformidade e integridade com `pnpm.cmd run lint` e `pnpm.cmd test` garantindo cobertura e ausência de regressões no projeto.
