# Validation Rules (Zod & Drizzle-Zod)

## Single Source of Truth & Create/Update Derivation
- Base all entity validation schemas on `createInsertSchema` from `drizzle-zod` as the authoritative source of truth.
- For update schemas, derive them cleanly by calling `.partial()` on the base create schema (e.g., `export const updateProfileSchema = createProfileSchema.partial();`) rather than constructing duplicate schemas or alias placeholders.

## Database Column Customization vs. Non-Database Extensions
- **No Redundant Omit/Extend**: Never omit a database column from `createInsertSchema` only to re-declare it in `.extend({ ... })`. Custom validations, regexes, length constraints, or UI-adapted shapes must be refined directly in the first argument of `createInsertSchema(table, { ... })`.
- **Extensions (.extend)**: Only non-database fields, form-only state, or cross-domain metadata should be added via `.extend({ ... })`.

## Schema Omissions (.omit)
- Only omit system/auto-generated fields (e.g., `id`, `createdAt`, `updatedAt`) or columns that must never be accepted from client input.
- Only omit fields that actually exist on the target Drizzle table. Omitting non-existent columns causes TypeScript errors.

## Naming & Case Consistency
- Always use `camelCase` for all schema keys across the entire stack. Never use `snake_case` in form inputs or action parameters. Drizzle maps TypeScript `camelCase` to Postgres `snake_case` automatically.

## URL Validation
- In Zod 4, `z.string().url()` is deprecated. Always use the top-level `z.url()` constructor for properties representing URLs, websites, and social links.

## Enums
- Always import enum arrays from standard schema definitions (e.g., `@/lib/db/schema/enums`) using `.enumValues` rather than redefining string literal arrays.

## Custom Issue Codes
- `z.ZodIssueCode` is deprecated. Use raw string literals (e.g., `code: "custom"`) in refinements.
