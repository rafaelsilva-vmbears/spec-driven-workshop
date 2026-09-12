## 1. Definições no Domínio

- [x] 1.1 Criar a interface de contrato `ErrorResponse` em `src/domain/exception/error-response.interface.ts` e verificar compilação com `pnpm build`.
- [x] 1.2 Criar a classe base `DomainException` em `src/domain/exception/domain.exception.ts` com suporte a `errorCode`, `statusCode` e `details`, e verificar compilação com `pnpm build`.

## 2. Filtro Global e Registro no NestJS

- [x] 2.1 Implementar `AllExceptionsFilter` em `src/adapters/api/filters/global-exception.filter.ts` com mapeamento polimórfico (`DomainException`, `HttpException` e 500 não tratado) e logging via Pino.
- [x] 2.2 Registrar `AllExceptionsFilter` como provider global `APP_FILTER` em `src/app.module.ts` e verificar compilação com `pnpm build`.

## 3. Testes e Validação de Qualidade

- [x] 3.1 Criar testes unitários em `src/adapters/api/filters/global-exception.filter.spec.ts` cobrindo cenários de exceção de domínio, erro HTTP/validação e erro inesperado, validando execução via `pnpm test`.
- [x] 3.2 Executar quality gates de linting e testes (`pnpm lint` e `pnpm test`) garantindo zero regressões e aprovação em todos os testes.
