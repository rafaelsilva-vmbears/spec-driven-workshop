---
name: scaffold-feature
description: Generate the vertical skeleton for a new domain feature. Use when creating a new entity, adding a CRUD endpoint, or starting any new feature slice that cuts through domain → adapters → tests.
---

# Scaffold Feature

Generate the file skeleton for a **vertical feature slice** in this project's Clean Architecture layout. The skeleton follows the naming conventions in `AGENTS.md` and the DIP pattern in [ADR-0001](../../docs/adr/0001-clean-architecture-and-dip.md).

When exploring the codebase, read `CONTEXT.md` (if it exists) so entity names and field vocabulary match the project's domain language.

## Input

The user provides an **entity name** (e.g. `task`, `comment`, `tag`). Derive all filenames and class names from it:

- Filename: `kebab-case` (e.g. `task`)
- Class: `PascalCase` (e.g. `Task`)
- Repository: `{Entity}Repository` (abstract), `{Entity}RepositoryImpl` (concrete)
- Use case: `Create{Entity}UseCase`, `Find{Entity}ByIdUseCase`, etc.

## Files to generate

Generate **only** the files the user asked for. If they said "scaffold feature task", generate the full set below. If they said "add a use case for listing tasks", generate only the use case file and its test.

### Domain layer (`src/domain/`) — framework-free

| File | Contents |
|---|---|
| `model/{entity}.ts` | Class with self-validating constructor. No decorators. Named export. |
| `ports/repositories/{entity}.repository.ts` | `export abstract class {Entity}Repository` with abstract methods. |
| `usecase/create-{entity}.usecase.ts` | Use case injecting the abstract repository via constructor. No `@Injectable`. |
| `exception/{entity}-not-found.exception.ts` | Domain exception extending a base error. |
| `model/{entity}.spec.ts` | Unit test for constructor invariants (valid + invalid inputs). |

### Adapters layer (`src/adapters/`) — NestJS + Drizzle

| File | Contents |
|---|---|
| `repositories/{entity}.repository.impl.ts` | `@Injectable()` class implementing the abstract port. Injects `DRIZZLE`. |
| `api/dto/create-{entity}.dto.ts` | DTO with `class-validator` decorators. |
| `api/controllers/{entity}.controller.ts` | `@Controller` injecting use cases. Routes follow REST conventions. |
| `modules/{entity}.module.ts` | NestJS module with `{ provide: {Entity}Repository, useClass: {Entity}RepositoryImpl }`. |

### Test files

| File | Contents |
|---|---|
| `tests/integration/{entity}.repository.integration.spec.ts` | Stub for integration test against real DB. |
| `tests/e2e/{entity}.e2e-spec.ts` | Stub for HTTP e2e test via Supertest. |

## Domain model rules

Every domain entity constructor **must**:

1. Accept a plain props object (not individual arguments).
2. Validate all invariants and throw a domain exception on violation.
3. Expose state via readonly properties, never public setters.
4. Never import from `@nestjs/*`, `drizzle-orm`, or `class-validator`.

```typescript
// Example: src/domain/model/task.ts
export class Task {
  readonly id: string
  readonly title: string
  readonly status: TaskStatus

  constructor(props: { id: string; title: string; status: TaskStatus }) {
    if (!props.title || props.title.trim().length === 0) {
      throw new InvalidTaskException('Title must not be empty')
    }
    this.id = props.id
    this.title = props.title.trim()
    this.status = props.status
  }
}
```

## DIP binding pattern

The module **must** use the abstract class as the injection token — no strings, no Symbols:

```typescript
// Example: src/adapters/modules/task.module.ts
import { Module } from '@nestjs/common'
import { TaskRepository } from '@domain/ports/repositories/task.repository'
import { TaskRepositoryImpl } from '@adapters/repositories/task.repository.impl'
import { CreateTaskUseCase } from '@domain/usecase/create-task.usecase'
import { TaskController } from '@adapters/api/controllers/task.controller'

@Module({
  controllers: [TaskController],
  providers: [
    { provide: TaskRepository, useClass: TaskRepositoryImpl },
    CreateTaskUseCase,
  ],
  exports: [TaskRepository],
})
export class TaskModule {}
```

## After scaffolding

1. Register the new module in `src/app.module.ts` imports.
2. Add the table definition to `src/adapters/database/drizzle/schema.ts`.
3. Run the quality gate: `pnpm check && pnpm test`.
4. Report the list of generated files to the user.
