import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: varchar('description', { length: 2000 }),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
})

export type TaskRow = typeof tasks.$inferSelect
export type NewTaskRow = typeof tasks.$inferInsert
