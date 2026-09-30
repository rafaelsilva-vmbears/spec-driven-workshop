---
name: verify-architecture
description: Scan the codebase for architecture violations. Use when checking domain purity, DIP bindings, naming conventions, or before merging a feature branch.
---

# Verify Architecture

Automated architecture guardrail. Scans the codebase and reports violations of the rules in `AGENTS.md` and [ADR-0001](../../docs/adr/0001-clean-architecture-and-dip.md).

## Checks

Run every check below. Report **only violations found** — do not report passing checks.

### 1. Domain purity

Scan every file in `src/domain/` for **forbidden imports**:

```
@nestjs/*
drizzle-orm
class-validator
class-transformer
nestjs-pino
pg
fastify
```

**Violation**: any `import` statement in `src/domain/**/*.ts` that references the packages above.

**What to report**: file path, line number, the forbidden import.

### 2. DIP token integrity

Scan `src/adapters/modules/**/*.module.ts` for provider bindings.

**Violation**: any provider that uses a string token (`provide: 'SOME_TOKEN'`) or Symbol token (`provide: Symbol(...)`) instead of an abstract class reference.

**What to report**: file path, the offending provider declaration.

### 3. Constructor validation

Scan `src/domain/model/**/*.ts` (excluding `*.spec.ts`) for entity classes.

**Violation**: a class whose constructor does **not** contain any `throw` statement (missing invariant validation).

**What to report**: file path, class name, suggestion to add validation.

### 4. Naming conventions

Scan all `.ts` files in `src/` against the naming table in `AGENTS.md`:

| Directory | Expected suffix |
|---|---|
| `src/domain/usecase/` | `.usecase.ts` |
| `src/domain/ports/repositories/` | `.repository.ts` |
| `src/adapters/repositories/` | `.repository.impl.ts` |
| `src/adapters/api/controllers/` | `.controller.ts` |
| `src/adapters/api/dto/` | `.dto.ts` |
| `src/adapters/modules/` | `.module.ts` |
| `src/domain/exception/` | `.exception.ts` |

**Violation**: a `.ts` file in a convention-governed directory that does not match the expected suffix.

**What to report**: file path, expected suffix, actual filename.

### 5. Orphan ports

Scan `src/domain/ports/repositories/` for abstract classes. For each, verify that:
- A concrete implementation exists in `src/adapters/repositories/`
- The implementation is registered as a provider in some `*.module.ts`

**Violation**: abstract port with no implementation, or implementation not registered.

**What to report**: port file, what is missing (impl or registration).

### 6. Export discipline

Scan `src/domain/**/*.ts` and `src/adapters/**/*.ts` for `export default`.

**Violation**: any use of `export default` (project uses named exports exclusively).

**What to report**: file path, line number.

## Output format

```markdown
## Architecture Verification Report

### ✅ Passing (N/N checks)
### ❌ Violations found (N)

#### Domain purity
- `src/domain/model/task.ts:3` — imports `@nestjs/common` (forbidden)

#### DIP token integrity
- (none)

...
```

## When to run

- After `/scaffold-feature` completes
- Before merging any feature branch
- When `/code-review` runs the Standards axis
- On explicit user request
