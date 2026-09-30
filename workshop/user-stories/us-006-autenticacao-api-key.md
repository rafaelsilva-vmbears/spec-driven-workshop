# US-006 – Autenticação universal via API Key

**Como** Operador  
**Eu quero** que todos os endpoints de negócio sejam protegidos universalmente por API Key  
**Para** garantir o princípio *Secure by Default* sem acoplamento a serviços externos de autenticação no MVP.

## Critérios de Aceitação

1. Todos os endpoints da API devem exigir a chave de acesso através do cabeçalho HTTP `x-api-key`.
2. A segurança deve ser aplicada globalmente no container NestJS via `APP_GUARD` com o `ApiKeyGuard`.
3. Endpoints públicos devem ser explicitamente liberados via decorator customizado `@Public()`. No MVP isso vale só para `/actuator/health`.
   - `/actuator/prometheus` não é rota do Nest: as métricas são expostas pelo `PrometheusExporter` do OpenTelemetry em porta própria (`src/instrumentation.ts`), fora do guard.
   - A documentação em `/docs` já é controlada por `SCALAR_ENABLED`/`SWAGGER_ENABLED` e fica fora do guard.
4. Caso o cabeçalho `x-api-key` esteja ausente ou o valor não corresponda à chave configurada:
   - Retornar HTTP 401 Unauthorized.
   - Resposta padronizada:
     ```json
     {
       "code": "UNAUTHORIZED",
       "message": "API key is missing or invalid"
     }
     ```
5. A chave válida é obtida via `ConfigService` a partir da variável de ambiente `API_KEY`, declarada em `src/types/environment.d.ts`.
6. **Fail-fast:** se `API_KEY` estiver ausente ou vazia, a aplicação não sobe.
7. A comparação da chave é feita em tempo constante (`crypto.timingSafeEqual`).
8. O documento OpenAPI declara o esquema de segurança `x-api-key` (API key no header) e o aplica aos endpoints protegidos.

## Notas de Negócio

- O padrão Secure by Default evita que alguém esqueça de proteger um controller novo.
- A chave é global para o ambiente e não há multi-tenancy ([ADR-0001](../../docs/adr/0001-chave-de-api-global-sem-multi-tenancy.md)).
