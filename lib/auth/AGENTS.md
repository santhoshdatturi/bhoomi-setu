# Auth & Environment Boundaries (Server vs Client)
- **Server Actions & Backend (`"use server"`, services, API routes)**:
  - **CRITICAL**: NEVER import client auth (`@/lib/auth/client` / `authClient`) in Server Actions or server files. ALWAYS import `auth` or `requireAuth` from `@/lib/auth` and use `const session = await auth.api.getSession({ headers: await headers() })` (or `await requireAuth()`).
- **Client Components (`"use client"`)**:
  - Use `authClient` from `@/lib/auth/client` for client-side hooks and actions (`authClient.useSession()`, `authClient.signOut()`).
