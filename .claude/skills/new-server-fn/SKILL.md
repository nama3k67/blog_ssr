---
name: new-server-fn
description: Scaffolds a new createServerFn in a service file following this project's patterns (TanStack Start + Zod + optional withAdmin wrapper).
user-invocable: true
---

# New Server Function

Scaffold a `createServerFn` in `src/shared/services/` following established patterns.

## Steps

1. Ask the user for:
   - **Function name** — exported const name, e.g. `fetchCommentsFn`
   - **HTTP method** — `GET` or `POST`
   - **Service file** — which file in `src/shared/services/` (e.g. `post.ts`, `admin.ts`)
   - **Admin only?** — yes/no (wraps handler in `withAdmin`)
   - **Input schema** — describe the shape, or "none" for no input
   - **Schema location** — if input is not "none": inline (define in service file) or shared (import from `src/shared/schemas/`)?
   - **DB access needed?** — yes/no

2. Read the target service file to understand existing imports and section grouping.

3. Generate the server function block. Match the file's exact style (tabs, double quotes).

### Pattern: no input, admin-wrapped

```ts
export const myFn = createServerFn({ method: "GET" }).handler(
  withAdmin(async () => {
    // logic
  }),
);
```

### Pattern: with input schema, admin-wrapped

```ts
const myFnSchema = z.object({ id: z.uuid() });

export const myFn = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof myFnSchema>) => myFnSchema.parse(data))
  .handler(
    withAdmin(async ({ data }) => {
      // logic
    }),
  );
```

### Pattern: with input schema, public (no admin)

```ts
const myFnSchema = z.object({ lang: z.string() });

export const myFn = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof myFnSchema>) => myFnSchema.parse(data))
  .handler(async ({ data }) => {
    // logic
  });
```

4. Append the generated block:
   - If the file has READ / WRITE / ADMIN section comments, insert under the matching section.
   - If no sections exist, append at the end of the file.

5. Check imports — add any that are missing:

   ```ts
   import { createServerFn } from "@tanstack/react-start";
   import { withAdmin } from "~/server/utils/withAdmin"; // only if admin-wrapped
   import { z } from "zod"; // only if input schema used
   ```

   If schema is shared, import from `~/shared/schemas/<file>` instead of defining inline.

6. If DB access is needed, remind the user to add the corresponding query in `src/server/db/queries.ts` before wiring the handler logic.
