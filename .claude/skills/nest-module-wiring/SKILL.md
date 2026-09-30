---
name: nest-module-wiring
description: Register DIP bindings and wire NestJS modules. Use when connecting a domain port to its adapter implementation, registering a new feature module, or debugging injection errors.
---

# NestJS Module Wiring

Register **Dependency Inversion** bindings in NestJS modules following [ADR-0001](../../docs/adr/0001-clean-architecture-and-dip.md). The abstract class is the injection token — no strings, no Symbols.

## Process

### 1. Verify the port exists

Check that the abstract class exists in `src/domain/ports/repositories/`:

```typescript
// src/domain/ports/repositories/task.repository.ts
export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>
  abstract findById(id: string): Promise<Task | null>
}
```

If the port does not exist, create it first (or use `/scaffold-feature`).

### 2. Verify the implementation exists

Check that a concrete class exists in `src/adapters/repositories/`:

```typescript
// src/adapters/repositories/task.repository.impl.ts
import { Injectable, Inject } from '@nestjs/common'
import { TaskRepository } from '@domain/ports/repositories/task.repository'
import { DRIZZLE, DrizzleDB } from '@adapters/database/drizzle/drizzle.module'

@Injectable()
export class TaskRepositoryImpl extends TaskRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {
    super()
  }

  async create(task: Task): Promise<Task> {
    // implementation
  }

  async findById(id: string): Promise<Task | null> {
    // implementation
  }
}
```

**Rules**:
- The impl class **extends** the abstract class (not implements an interface).
- `@Injectable()` is on the impl, never on the abstract port.
- The `DRIZZLE` Symbol token is the **only** allowed Symbol token in this project — it is for the database connection, not for domain ports.

### 3. Create or update the feature module

The module lives in `src/adapters/modules/{entity}.module.ts`:

```typescript
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

**Binding rules**:
- `provide:` is always the **abstract class** imported from `@domain/ports/`.
- `useClass:` is the **concrete implementation** from `@adapters/repositories/`.
- Use cases are registered as plain providers (NestJS auto-resolves their constructor deps).
- Export the abstract port if other modules need to inject it.

### 4. Register in AppModule

Add the feature module to `src/app.module.ts` imports:

```typescript
import { TaskModule } from '@adapters/modules/task.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    LoggerModule.forRoot({ ... }),
    TaskModule,  // ← add here
  ],
})
export class AppModule {}
```

### 5. Verify

Run the quality gate:

```bash
pnpm check && pnpm test
```

If integration or e2e tests exist for this feature, also run:

```bash
pnpm test:integration
pnpm test:e2e
```

## Debugging injection errors

### "Nest can't resolve dependencies of X"

1. Check that the module providing the dependency is **imported** by the module that needs it.
2. Check that the provider uses the **abstract class** as the token (not a string or the impl class).
3. Check that the abstract class is **exported** by the providing module.

### "No provider for TaskRepository"

The binding `{ provide: TaskRepository, useClass: TaskRepositoryImpl }` is missing from the module's `providers` array, or the module is not imported.

### Circular dependency

Split the circular modules and use `forwardRef()` only as a last resort. Prefer restructuring: if module A and B depend on each other, extract the shared port into a shared module.
