## Why

Antes de iniciar o desenvolvimento das User Stories e das especificações funcionais da API de gerenciamento de tarefas, é necessário validar e consolidar a base técnica do projeto (bootstrap do NestJS, Fastify, Drizzle ORM, scripts de lint/formatação e suíte de testes Vitest). Esta mudança serve como um enabler técnico de infraestrutura, garantindo que o template compila, executa os quality gates e se conecta corretamente às dependências de infraestrutura sem alterar contratos comportamentais da API pública.

## What Changes

- Validação e consolidação do esqueleto NestJS 12 com adapter Fastify e documentação Swagger inicial.
- Verificação do módulo de persistência Drizzle ORM integrado ao PostgreSQL via variáveis de ambiente (`DATABASE_URL`).
- Configuração e validação dos scripts de qualidade de código (linting e formatação com ESLint/Prettier).
- Garantia de execução das suítes de testes automatizados com Vitest (unitários, integração e e2e).
- Definição do enabler com `skip_specs: true` no OpenSpec, pois não há introdução ou alteração de capacidades de negócio no nível de API.

## Capabilities

### New Capabilities

Nenhuma. Esta mudança é estritamente de infraestrutura e ferramental técnico (enabler), sem introdução de endpoints ou comportamentos de negócio para o usuário final.

### Modified Capabilities

Nenhuma. Não há requisitos comportamentais ou capacidades prévias sendo modificadas.

## Impact

- **Código e Configuração**: Arquivos de bootstrap (`src/main.ts`, `src/app.module.ts`), configurações de banco (`drizzle.config.ts`, `src/adapters/database/drizzle/`) e scripts em `package.json`.
- **Dependências**: Node.js 22+, pnpm, NestJS 12, Fastify, Drizzle ORM, Vitest, ESLint, Prettier.
- **Sistemas**: Banco de dados PostgreSQL (via Docker Compose) para suporte aos futuros testes de integração e migrações.
