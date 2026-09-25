# Database & Convex Backend Conventions

This document outlines backend database conventions, schema definitions, reactive queries, mutations, indexing, and multi-tenant access control using **Convex**.

---

## 1. Convex Architecture Overview & Client Setup

The backend uses Convex for reactive document metadata storage.

- **Realtime Subscriptions**: UI components use `useQuery` from `convex/react` to automatically re-render when data changes on the server. Returns `undefined` while loading.
- **Atomic Mutations**: State changes (create document, rename, delete) use `useMutation` with built-in optimistic updates and transactional safety.
- **Type Safety**: Queries and mutations are strongly typed via generated API types (`@/convex/_generated/api`).
- **Client Provider (`components/convex-client-provider.tsx`)**:
  Wraps application children in `<ConvexProvider client={convex}>` with `new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)`. Integrated in root `app/layout.tsx`.
- **Codegen Isolation**: `convex/_generated/` is generated automatically by `npx convex dev` and excluded from ESLint and Prettier.

---

## 2. Schema Definition (`convex/schema.ts`)

Schema definitions must use strict runtime validators (`v`):

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    initialContent: v.optional(v.string()),
    ownerId: v.string(),
    roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_organization_id", ["organizationId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["ownerId", "organizationId"],
    }),
})
```

---

## 3. Query & Mutation Guidelines

### Authentication & Authorization Check

Every mutation and query accessing private documents must verify the user identity:

```typescript
// convex/documents.ts
import { mutation, query } from "./_generated/server"

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined

    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect()
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", user.subject))
      .collect()
  },
})
```

---

## 4. Multi-Tenancy Invariant

Documents belong to either:

1. **An Organization**: If created while active in a Clerk organization (`organizationId` set).
2. **An Individual User**: If created in a personal workspace (`ownerId` set, `organizationId` undefined).

Queries and search operations must filter strictly by active context to prevent data leaks across workspaces.
