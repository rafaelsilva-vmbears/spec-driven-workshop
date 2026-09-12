## Why

Atualmente, os endpoints da API não possuem validação ativa do header `x-api-key` em tempo de execução, permitindo requisições não autorizadas. Para atender à US-006 e cumprir o contrato de segurança definido em `task-api`, é necessário implementar o `ApiKeyGuard` e registrá-lo globalmente seguindo o princípio Secure by Default, com suporte a rotas públicas através do decorator `@Public()`.

## What Changes

- Criação do decorator `@Public()` em `src/adapters/api/guards/public.decorator.ts` utilizando metadados do `Reflector`.
- Implementação do `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.ts` validando o header `x-api-key` contra o `ConfigService` (`API_KEY`).
- Registro global do guard via provider `APP_GUARD` em `src/app.module.ts`.
- Criação de testes unitários em `src/adapters/api/guards/api-key.guard.spec.ts` cobrindo cenários com header ausente, chave inválida, chave válida e rota pública.
- Atualização do delta spec para a capacidade `task-api` formalizando a exceção para rotas públicas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `task-api`: Refinamento do requisito de autenticação obrigatória via API Key para formalizar o comportamento de Secure by Default e bypass de autenticação em rotas com decorator `@Public()`.

## Impact

- **Segurança**: Princípio Secure by Default ativo em toda a aplicação. Novas rotas são protegidas automaticamente sem depender de anotação manual por controller.
- **Roteamento**: Rotas públicas (como documentação Swagger e health checks) devem usar explicitamente `@Public()`.
- **Compatibilidade**: Integração transparente com o filtro global `AllExceptionsFilter` (US-007) para retorno de HTTP 401 formatado.
