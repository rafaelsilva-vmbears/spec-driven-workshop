# Agent Guidelines

Diretrizes e padrões operacionais para coding agents neste repositório.

## Agent skills

### Issue tracker

Local markdown files in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout (`CONTEXT.md` and `docs/adr/`). See `docs/agents/domain.md`.

---

## Engenharia & Arquitetura Alvo

Neste repositório seguimos **Engenharia de Software Assistida por Agentes** (sem *vibe coding*). As decisões e implementações devem obedecer aos seguintes princípios fundamentais:

1. **Clean Architecture & Separação de Camadas**:
   - **Camada de Domínio (`src/domain/`)**: Framework-free e pura. Proibido importar decorators do NestJS (`@Injectable`, `@Controller`), bibliotecas de ORM (Drizzle) ou decorators de validação de HTTP. O modelo de domínio protege suas próprias invariantes no construtor.
   - **Inversão de Dependência (DIP)**: Contratos de repositório em `src/domain/ports/` são declarados como classes abstratas do TypeScript (`export abstract class TaskRepository { ... }`) e implementados na camada de adaptadores (`src/adapters/database/repository/`).

2. **Test-Driven Development (TDD) via Seams**:
   - Sempre acordar e testar nas **costuras públicas (seams)** da arquitetura antes de codificar (`/tdd`).
   - Evitar testes tautológicos ou acoplados a detalhes internos de implementação (nunca testar métodos privados).
   - Manter cobertura de 100% de branches em regras e invariantes de negócio no domínio.

3. **Módulos Profundos (Deep Modules)**:
   - Seguir a filosofia de *A Philosophy of Software Design* (John Ousterhout): módulos devem ter interfaces públicas simples e sucintas que escondem implementações ricas e poderosas.

4. **Tracer Bullets (Fatias Verticais)**:
   - Todo ticket gerado pelo `/to-tickets` deve cortar uma fatia vertical completa de ponta a ponta (rota HTTP, use case, persistência e teste de validação), e nunca fatias puramente horizontais.
   - Respeitar a ordem de dependências do grafo de bloqueios (`Blocked by: ...`).

5. **Padrões de Código & Formatação**:
   - TypeScript estrito (ES2023).
   - ESLint e Prettier para linting e formatação rápida (`pnpm check`).
   - Vitest para testes unitários e de integração.
