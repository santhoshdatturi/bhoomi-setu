# Next.js Routing & Route Group Rules

- **Route Groups `(group)`**: Folder names in parentheses do NOT add a path segment to the URL. Never create a parallel root page file if a route group page already resolves to that exact URL.
- **Clean Absolute URLs**: Always double check internal redirects and router push paths to prevent duplicate route prefixes.
- **Public Route Access**: For every new or changed route, explicitly decide whether the route is public or authenticated by default before finishing.

# End-to-end testing

After any feature that spans both sides, exercise it like a person would — not just with unit tests.

- Drive the actual flow end to end: sign in, create a record, edit it, confirm the row in Postgres.
- Test the unhappy paths deliberately: duplicate submit, validation failures.
- Report what you clicked and what you saw. If a step failed, keep the failure — don't work around it and call it passing.
