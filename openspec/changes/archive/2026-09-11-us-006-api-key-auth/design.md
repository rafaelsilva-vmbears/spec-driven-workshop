## Context

Consulte `proposal.md` para motivação e `specs/task-api/spec.md` para os requisitos normativos. A documentação OpenAPI já declara `ApiKeyAuth` no header `x-api-key`, e a aplicação já possui o filtro `AllExceptionsFilter` ativo para tratamento uniforme de exceções. Este design detalha a implementação do guard de segurança transversal no NestJS com arquitetura Secure by Default.

## Goals / Non-Goals

**Goals:**
- Implementar o decorator `@Public()` para sinalizar exceções à regra geral de segurança.
- Implementar `ApiKeyGuard` implementando `CanActivate`, validando o header `x-api-key` contra o `ConfigService` (`API_KEY`).
- Registrar o guard globalmente como provider `APP_GUARD` no `AppModule`.
- Lançar `UnauthorizedException` com código `INVALID_API_KEY` quando a chave estiver ausente ou for inválida.
- Validar comportamento com testes unitários em `src/adapters/api/guards/api-key.guard.spec.ts`.

**Non-Goals:**
- Implementar persistência de chaves de API em banco de dados ou rotação de credenciais multi-tenant (o MVP utiliza chave estática em variável de ambiente).
- Implementar autenticação via JWT ou OAuth2.

## Decisions

### 1. Secure by Default via `APP_GUARD`
- **Decisão**: Configurar `ApiKeyGuard` como provider global `APP_GUARD` no `AppModule`.
- **Alternativas consideradas**: Aplicar `@UseGuards(ApiKeyGuard)` manualmente em cada controller.
- **Racional**: Garante que nenhuma rota seja acidentalmente exposta de forma pública por esquecimento de anotação. Apenas rotas explicitamente marcadas com `@Public()` são liberadas sem credenciais.

### 2. Metadados com `Reflector.getAllAndOverride`
- **Decisão**: Avaliar o decorator `@Public()` em nível de método e de classe utilizando a chave de metadados `isPublic`.
- **Alternativas consideradas**: Avaliar apenas o método ou apenas a classe.
- **Racional**: Permite marcar controllers inteiros como públicos (ex.: health checks) ou sobrescrever métodos específicos dentro de controllers protegidos.

### 3. Integração com `ErrorResponse` (US-007)
- **Decisão**: Lançar `UnauthorizedException({ code: 'INVALID_API_KEY', message: 'API key is missing or invalid' })`.
- **Alternativas consideradas**: Retornar booleano `false` diretamente no guard.
- **Racional**: Lançar a exceção com payload semântico assegura que o `AllExceptionsFilter` formate a resposta HTTP 401 rigorosamente de acordo com o contrato `{ code: 'INVALID_API_KEY', message: '...' }`.

## Risks / Trade-offs

- **[Bloqueio de Rotas Internas]** → Qualquer novo endpoint criado no sistema exigirá `x-api-key` por padrão. Para endpoints que devam ser públicos (como health check ou métricas), os desenvolvedores devem incluir `@Public()`.
