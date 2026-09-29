# Convex Mutations & Authorization

This document details the mutation patterns, multi-tenancy invariants, and authorization guard pattern for the Convex backend. For database queries, reactive pagination, and search indexing, consult [`docs/database-queries.md`](database-queries.md).

---

## 1. Document Creation Mutation (`convex/documents.ts`)

Every document creation mutation verifies user identity and attaches owner and organization context:

```typescript
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) {
      throw new ConvexError("Unauthorized")
    }

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined

    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    })
  },
})
```

---

## 2. Document Modification Mutations (`convex/documents.ts`)

All record-level mutations (`removeById`, `updateById`) enforce the dual ownership check (see § 4) before acting. Canonical pattern:

```typescript
export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new ConvexError("Unauthorized")

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined
    const document = await ctx.db.get(args.id)
    if (!document) throw new ConvexError("Document not found")

    const isOwner = document.ownerId === user.subject
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    )
    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized")
    }

    return await ctx.db.delete(args.id)
  },
})
```

`updateById` follows the identical guard sequence, ending with `ctx.db.patch(args.id, { title: args.title })`.

---

## 3. Multi-Tenancy Invariant

Documents belong to either:

1. **An Organization**: If created while active in a Clerk organization (`organizationId` set).
2. **An Individual User**: If created in a personal workspace (`ownerId` set, `organizationId` undefined).

Queries and search operations must filter strictly by active context to prevent data leaks across workspaces.

---

## 4. Authorization Guard Pattern (`convex/lib/auth.ts`)

All document-scoped mutations and queries apply standardized, reusable guards from `convex/lib/auth.ts`:

1. **Authenticate (`requireAuth`)**: `ctx.auth.getUserIdentity()` → throws `ConvexError("Unauthorized")` if absent, returning `{ user, userId, organizationId }`.
2. **Resolve & Authorize (`requireDocumentAccess`)**: Retrieves document by ID (`ctx.db.get(id)`), throws `ConvexError("Document not found")` if absent, and validates dual ownership via `hasDocumentAccess`: allows if caller is `ownerId` **or** shares the document's `organizationId`. Throws `ConvexError("Unauthorized")` otherwise.

Prefer `ConvexError` (from `convex/values`) over plain `Error` for all user-facing backend errors — it enables structured error payloads and typed client-side error handling via `.catch()`.
