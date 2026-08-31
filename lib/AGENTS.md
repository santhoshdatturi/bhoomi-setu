# Error handling (Services & Actions)

Fail early, fail loudly, and never swallow.

- **No empty `catch`**. Either handle it meaningfully or let it propagate.
- **ServiceResult**: Service functions must always return a `ServiceResult<T>` discriminated union, returning either `ok(data)` or `fail(code, internalMessage, cause)`.
- **Typed Errors**: Use `ServiceErrorCode` from `@/lib/services/errors` (e.g., `ServiceErrorCode.NOT_FOUND`). 
- **Error Messages**: Do not invent error strings. The `fail()` factory automatically pulls safe user messages from `ERROR_MESSAGES` so domain internals are never leaked to the UI.
- **Logging**: The `fail()` helper automatically logs using `createLogger("service.error")` when a `cause` is provided. Log with structured context.
- **Error Sanitization in UI**: Never display raw runtime or compiler error strings directly in user-facing toasts. The structured `ServiceErrorData` provides a safe `userMessage` to pass to `toast.error()`.

# Services & Drizzle Query Guidelines

- **Transactions Over Individual Calls**:
  - Always use database transactions (`await db.transaction(async (tx) => { ... })`) instead of individual standalone calls whenever performing multi-statement mutations, dependent queries, foreign key creations, or composite entity writes.
  - Wrap multi-table operations in transactions to guarantee atomicity and avoid partial database writes.
  - When inside a transaction block, always pass the transaction context `tx` to helper functions and domain service methods rather than calling `db` directly.
- **Object Spread**: Always use the object spread method (`...data`) in Drizzle `.values()` and `.set()` queries when passing strictly validated Zod payload objects. Avoid manual property-by-property remapping.
- **No Redundant Field Remapping**: When spreading `...data`, do not manually re-map optional or nullable fields. Drizzle handles `null` and `undefined` natively on nullable columns.
- **Payload Destructuring**: When a validated payload includes non-table fields, destructure them cleanly before spreading into table operations.
- **Non-null Column Defaults**: When a database column is defined as `.notNull()` without a schema default, supply a safe fallback during `.insert()` if the input data type allows `undefined`.
- **Partial Updates**: Services supporting partial updates should define payload interfaces with optional properties and validate conditional inputs only when those specific fields are provided in the payload.
