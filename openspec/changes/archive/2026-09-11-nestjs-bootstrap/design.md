## Context

O projeto utiliza NestJS 12 sobre a plataforma Fastify, utilizando Drizzle ORM conectado ao PostgreSQL como mecanismo de persistência, e Vitest como test runner oficial. Conforme detalhado em `proposal.md`, este design estabelece como a base técnica e as ferramentas de suporte são validadas antes do desenvolvimento orientado por especificações das User Stories.

## Goals / Non-Goals

**Goals:**
- Validar a compilação limpa do projeto com `pnpm build`.
- Confirmar conformidade com os padrões de linting e formatação de código.
- Garantir a viabilidade de injeção e ciclo de vida do `DrizzleModule` com `ConfigService`.
- Executar e validar a suíte inicial de testes com Vitest.

**Non-Goals:**
- Criar schemas de banco de dados de negócio ou tabelas no Drizzle (reservado para as User Stories US-001+).
- Implementar controllers, guards de autenticação (`x-api-key`) ou filtros globais de exceção (`ErrorResponse`).
- Gerar especificações canônicas de API pública (`skip_specs: true`).

## Decisions

### 1. NestJS 12 com Fastify Adapter
- **Decisão**: Utilizar `@nestjs/platform-fastify` no `main.ts` configurado para escutar em `0.0.0.0`.
- **Alternativas consideradas**: `@nestjs/platform-express`.
- **Racional**: Fastify oferece menor latência e maior throughput para APIs I/O-bound, mantendo compatibilidade com `@nestjs/swagger` via `@fastify/swagger`.

### 2. Drizzle ORM via Provider customizado (`DRIZZLE`)
- **Decisão**: Configurar `DrizzleModule` como módulo `@Global()` injetando uma instância de `NodePgDatabase` criada a partir de um pool `pg`.
- **Alternativas consideradas**: TypeORM ou Prisma.
- **Racional**: Drizzle ORM oferece tipagem estrita sem mágica de abstração excessiva, com inicialização leve e migrações eficientes via `drizzle-kit`.

### 3. Vitest como Test Runner Unificado
- **Decisão**: Configuração do Vitest com divisão por escopos (`vitest.unit.ts`, `vitest.integration.ts`, `vitest.e2e.ts`) usando `unplugin-swc`.
- **Alternativas consideradas**: Jest.
- **Racional**: Menor tempo de inicialização, execução nativa de módulos TypeScript e compatibilidade com o ecossistema moderno.

### 4. Pino Logger (`nestjs-pino`)
- **Decisão**: Configurar logs estruturados em JSON para produção e formatação legível com `pino-pretty` em desenvolvimento.
- **Alternativas consideradas**: Console padrão do NestJS ou Winston.
- **Racional**: Alta performance de logging assíncrono com metadados estruturados por requisição HTTP.

## Risks / Trade-offs

- **[Dependência de Conexão com Banco]** → `DrizzleModule` tenta instanciar conexão via `DATABASE_URL`. Em testes unitários, repositórios e serviços devem ser desacoplados via mocks e interfaces (DIP) para não exigir conexão externa.
- **[Compatibilidade de Middlewares com Fastify]** → Alguns plugins e interceptors Express-first não funcionam nativamente no Fastify. O time deve utilizar abstrações do NestJS (`CanActivate`, `ExceptionFilter`, `NestInterceptor`) para evitar acoplamento à engine HTTP subjacente.
