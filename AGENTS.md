# Agent Guidelines

Operational rules for coding agents in this repository.
This is an **agent-assisted engineering** codebase — no vibe coding.

---

## Codebase map

```text
src/
├── domain/                 ← Pure layer. Framework-free.
│   ├── model/              ← Rich domain entities (self-validating constructors)
│   ├── ports/              ← Abstract-class contracts (DIP tokens)
│   │   └── repositories/   ← Repository abstractions
│   ├── usecase/            ← Application use cases
│   ├── exception/          ← Domain-specific exceptions
│   ├── validators/         ← Domain validation logic
│   └── constants/          ← Domain enums and constants
├── adapters/               ← Framework & infra layer
│   ├── api/
│   │   ├── controllers/    ← NestJS route handlers
│   │   ├── dto/            ← Request/response DTOs (class-validator)
│   │   ├── filters/        ← Exception filters
│   │   ├── guards/         ← Auth guards (API key)
│   │   ├── interceptors/   ← Response interceptors
│   │   └── pipes/          ← Validation pipes
│   ├── database/
│   │   └── drizzle/        ← Drizzle ORM module & schema
│   ├── repositories/       ← Concrete port implementations
│   └── modules/            ← NestJS feature modules
├── shared/                 ← Cross-cutting utilities
├── app.module.ts
└── main.ts
tests/
├── integration/            ← DB-bound tests (*.integration.spec.ts)
└── e2e/                    ← HTTP-bound tests (*.e2e-spec.ts)
.scratch/                   ← Local issue tracker (specs + tickets)
docs/
├── adr/                    ← Architecture Decision Records
└── agents/                 ← Agent configuration docs
```

## Agent skills

- **Issue tracker**: local markdown in `.scratch/`. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- **Domain docs**: glossary in `CONTEXT.md`, decisions in `docs/adr/`. See [`docs/agents/domain.md`](docs/agents/domain.md).
- If `CONTEXT.md` does not exist yet, proceed silently — it is created on demand by `/grill-with-docs`.

### Project-native skills

Skills tailored to this project's Clean Architecture + NestJS + Drizzle stack:

- **`scaffold-feature`**: generate the vertical file skeleton for a new feature (entity, port, use case, repo impl, DTO, controller, module, tests). Use when starting any new feature slice.
- **`verify-architecture`**: scan for domain purity violations, DIP token misuse, naming convention drift, orphan ports, and export discipline. Use before merging or after scaffolding.
- **`drizzle-migration`**: guide schema changes in the single `schema.ts` file, generate and apply migrations. Use when adding or altering database tables.
- **`nest-module-wiring`**: register DIP bindings (`{ provide: AbstractClass, useClass: Impl }`) and wire feature modules into `AppModule`. Use when connecting ports to adapters or debugging injection errors.

---

## Architecture constraints

Full rationale in [ADR-0001](docs/adr/0001-clean-architecture-and-dip.md). The rules below are non-negotiable:

1. **Domain purity**: `src/domain/` must never import NestJS decorators (`@Injectable`, `@Controller`), ORM libraries (Drizzle), HTTP validation decorators, or any framework code. Domain entities validate their own invariants in the constructor.

2. **Dependency Inversion**: repository contracts in `src/domain/ports/` are `abstract class` declarations. The abstract class itself is the NestJS injection token — no string tokens, no `Symbol` tokens. Implementations live in `src/adapters/repositories/`.

3. **Deep Modules**: simple, narrow public interfaces hiding rich implementations (Ousterhout). Prefer fewer public methods with powerful behaviour over many thin pass-throughs.

4. **Tracer Bullets**: every ticket cuts a vertical slice end-to-end (route → use case → persistence → validation test). Horizontal-only slices are rejected. Respect the `Blocked by:` dependency graph.

---

## Development workflow

1. **TDD via seams**: write tests at public architectural seams *before* writing production code. Never test private methods. Target 100% branch coverage on domain invariants and business rules.

2. **Cycle**: Red → Green → Refactor. Each cycle ends with a passing quality gate (see below).

3. **Code review**: two axes — *Standards* (does it follow this repo's rules?) and *Spec* (does it match the originating issue?).

---

## Naming & file conventions

| Artefact | Pattern | Example |
|---|---|---|
| Domain entity | `kebab-case.ts`, class PascalCase | `task.ts` → `class Task` |
| Use case | `kebab-case.usecase.ts` | `create-task.usecase.ts` |
| Port (abstract) | `kebab-case.repository.ts` | `task.repository.ts` |
| Port impl | `kebab-case.repository.impl.ts` | `task.repository.impl.ts` |
| Controller | `kebab-case.controller.ts` | `task.controller.ts` |
| DTO | `kebab-case.dto.ts` | `create-task.dto.ts` |
| Unit test | co-located `*.spec.ts` | `task.spec.ts` |
| Integration test | `tests/integration/*.integration.spec.ts` | `task.repository.integration.spec.ts` |
| E2E test | `tests/e2e/*.e2e-spec.ts` | `task.e2e-spec.ts` |
| NestJS module | `kebab-case.module.ts` | `task.module.ts` |
| Domain exception | `kebab-case.exception.ts` | `task-not-found.exception.ts` |
| Drizzle schema | all tables in `src/adapters/database/drizzle/schema.ts` | — |

**Path aliases** (configured in `tsconfig.json` and `vitest.config.ts`):
- `@domain/*` → `src/domain/*`
- `@adapters/*` → `src/adapters/*`
- `@shared/*` → `src/shared/*`
- `@src/*` → `src/*`
- `@tests/*` → `tests/*`

**Exports**: prefer named exports. One public concept per file.

---

## Quality gate

Run before every commit. All must pass:

```bash
pnpm check          # ESLint (strict TS + Prettier enforcement)
pnpm test           # Unit tests (Vitest, src/**/*.spec.ts)
```

For changes touching persistence or HTTP:

```bash
pnpm test:integration   # tests/integration/**/*.integration.spec.ts
pnpm test:e2e           # tests/e2e/**/*.e2e-spec.ts
```

If any gate fails, fix before committing — never skip.

---

## Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/) — imperative, lowercase, max 72 chars:

```
<type>(<scope>): <description>

[optional body]
```

| Type | When |
|---|---|
| `feat` | New feature or behaviour |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, CI config |

**Scope** = domain area or module (`task`, `auth`, `api`, `db`, `infra`).

---

## Stack reference

- **Runtime**: Node.js 22+, TypeScript strict (ES2023)
- **Framework**: NestJS 12 + Fastify 5
- **ORM**: Drizzle ORM + PostgreSQL 15
- **Tests**: Vitest 5 + Supertest
- **Lint**: ESLint + Prettier (`pnpm check`)
- **Package manager**: pnpm 10+
- **Build**: SWC (fast transpilation)
