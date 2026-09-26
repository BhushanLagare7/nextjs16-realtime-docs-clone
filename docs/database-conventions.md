# Database & Convex Backend Conventions

This document outlines backend database conventions, schema definitions, reactive queries, mutations, indexing, and multi-tenant access control using **Convex**.

---

## 1. Convex Architecture Overview & Client Setup

The backend uses Convex for reactive document metadata storage.

- **Realtime Subscriptions**: UI components use `useQuery` from `convex/react` to automatically re-render when data changes on the server. Returns `undefined` while loading.
- **Atomic Mutations**: State changes (create document, rename, delete) use `useMutation` with built-in optimistic updates and transactional safety.
- **Type Safety**: Queries and mutations are strongly typed via generated API types (`@/convex/_generated/api`).
- **Client Provider (`components/convex-client-provider.tsx`)**:
  Wraps application children in `<ClerkProvider appearance={{ theme: shadcn }}>` and `<ConvexProviderWithClerk client={convex} useAuth={useAuth}>`. Gates access states (`<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>`).
- **Convex Auth Config (`convex/auth.config.ts`)**:
  Configures the Clerk JWT issuer domain (`CLERK_JWT_ISSUER_DOMAIN`) and application ID (`convex`) for server-side token verification.
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

## 3. Mutations, Pagination & Authorization

Detailed mutation patterns, pagination queries, multi-tenancy invariants, and the authorization guard convention are documented in [`docs/database-mutations.md`](database-mutations.md).
