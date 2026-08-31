# Database, Drizzle & PostgreSQL Guidelines

## Transactions Over Individual Calls (Mandatory Performance & Constraints)
- **Mandatory Transactions**: The database is connected via Neon WebSocket server (`drizzle-orm/neon-serverless` + `Pool`), which fully supports interactive Drizzle transactions.
- **Use Transactions Instead of Individual Calls**: Always use `await db.transaction(async (tx) => { ... })` instead of standalone individual queries whenever performing:
  - Multi-statement mutations (e.g. create/update/delete across one or more tables)
  - Dependent queries or reads followed by writes (e.g. read status -> update record)
  - Entity writes with related child records, foreign keys, or file attachments
  - Any operation requiring atomicity or rollback on failure
- **Transaction Propagation**: Inside a transaction block, always pass the transaction handle `tx` to nested functions or use `tx` for all internal queries. Never mix `db` and `tx` in the same operation.

## PostgreSQL Identifier Limits (< 63 characters)
- PostgreSQL strictly truncates any identifier (table, column, index, foreign key constraint) that exceeds 63 characters (`NAMEDATALEN - 1`).
- Drizzle auto-generates long FK names, which easily exceed 63 characters and trigger `NOTICE: 42622 identifier will be truncated`.
- **Rule**: Whenever defining relations on multi-word tables, explicitly name table-level foreign keys with concise short names and short index names (`idx_...`).

## Drizzle Schema & Migration Workflow
- **CRITICAL BLOCKER**: NEVER run `npm run db:push` (`drizzle-kit push`), `npm run db:generate` (`drizzle-kit generate`), or any database migration scripts automatically. Always present schema changes to the developer so they can review, execute the commands manually, and provide feedback.
- **Foreign Keys**: All file attachments referenced by domain entities must explicitly define a foreign key linking to `files.id` in `lib/db/schema/files.ts`.

## Performance
- Filter, sort, aggregate, and paginate in SQL. Never pull rows into Node to filter them there.
- Select the columns you need. `select *` is not acceptable in a repo function.
- No N+1. Join or batch — one query per request path, not one per row.
- New query patterns come with an index in the same migration.
