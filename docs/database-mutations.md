# Convex Mutations & Authorization

This document details the query, mutation, pagination, multi-tenancy, and authorization guard patterns for the Convex backend.

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

## 2. Reactive Pagination Query (`convex/documents.ts`)

Cursor-based reactive pagination uses `paginationOptsValidator` from `"convex/server"`:

```typescript
export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, search }) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new ConvexError("Unauthorized")

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined

    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("organizationId", organizationId)
        )
        .paginate(paginationOpts)
    }

    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("ownerId", user.subject)
        )
        .paginate(paginationOpts)
    }

    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .paginate(paginationOpts)
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", user.subject))
      .paginate(paginationOpts)
  },
})
```

Client components consume paginated queries via `usePaginatedQuery(api.documents.get, { search }, { initialNumItems: 5 })`.

---

## 3. Document Modification Mutations (`convex/documents.ts`)

All record-level mutations (`removeById`, `updateById`) enforce the dual ownership check (see § 5) before acting. Canonical pattern:

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

## 4. Multi-Tenancy Invariant

Documents belong to either:

1. **An Organization**: If created while active in a Clerk organization (`organizationId` set).
2. **An Individual User**: If created in a personal workspace (`ownerId` set, `organizationId` undefined).

Queries and search operations must filter strictly by active context to prevent data leaks across workspaces.

---

## 5. Authorization Guard Pattern

All document-scoped mutations (`removeById`, `updateById`, and future mutations) must apply the **dual ownership check**:

1. **Authenticate**: `ctx.auth.getUserIdentity()` → throw `ConvexError("Unauthorized")` if absent.
2. **Resolve document**: `ctx.db.get(args.id)` → throw `ConvexError("Document not found")` if absent.
3. **Authorize**: Allow if caller is the `ownerId` **or** shares the document's `organizationId`. Throw `ConvexError("Unauthorized")` otherwise.

Prefer `ConvexError` (from `convex/values`) over plain `Error` for all user-facing backend errors — it enables structured error payloads and typed client-side error handling via `.catch()`.
