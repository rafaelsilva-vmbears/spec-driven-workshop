---
name: drizzle-migration
description: Guide Drizzle schema changes and migration generation. Use when adding or altering database tables, columns, or indexes in this project.
---

# Drizzle Migration

Guide the creation and application of Drizzle ORM schema changes. This project keeps **all tables in a single schema file** at `src/adapters/database/drizzle/schema.ts`.

## Process

### 1. Edit the schema

Open `src/adapters/database/drizzle/schema.ts` and add or modify the table definition.

**Rules**:
- All tables live in this single file — no separate schema files per feature.
- Use `pgTable` from `drizzle-orm/pg-core`.
- Column names use `snake_case`; TypeScript field names use `camelCase` (Drizzle maps them).
- Always add `createdAt` and `updatedAt` timestamps.
- For soft delete, add `deletedAt` as a nullable timestamp.
- Use `uuid` for primary keys with `defaultRandom()`.

```typescript
// Example table definition
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'done'])

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})
```

### 2. Generate the migration

Run from the project root:

```bash
npx drizzle-kit generate
```

This reads `drizzle.config.ts` (which points to `schema.ts`) and produces a SQL migration file in the `drizzle/` directory.

**Verify**: open the generated `.sql` file and confirm the DDL matches your intent. Drizzle-kit generates migrations by diffing the schema against the previous snapshot.

### 3. Apply the migration

Ensure PostgreSQL is running (via Docker Compose):

```bash
docker compose up -d
```

Then apply:

```bash
pnpm db:migrate
```

### 4. Verify

- Check that the migration was applied: the `drizzle/meta/_journal.json` should show the new entry.
- Run integration tests if they exist: `pnpm test:integration`.

## Common patterns

### Adding a column to an existing table

Edit the table in `schema.ts`, add the column, run `npx drizzle-kit generate`. The migration will be an `ALTER TABLE ADD COLUMN`.

### Adding an enum

Define with `pgEnum` **before** the table that uses it. The migration will include `CREATE TYPE`.

### Adding a relation

Use Drizzle's `relations()` API in `schema.ts` for query-time joins. Foreign key constraints go in the table definition via `.references()`.

## What NOT to do

- Do not create schema files outside `src/adapters/database/drizzle/schema.ts`.
- Do not edit generated migration SQL files manually — if wrong, delete the migration and regenerate.
- Do not import from `schema.ts` inside `src/domain/` — that violates domain purity.
