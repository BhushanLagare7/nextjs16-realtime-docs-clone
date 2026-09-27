# Convex Database Queries & Search

This document details the reactive pagination query, internal direct lookup query, and search index integration using **Convex**.

---

## 1. Reactive Pagination Query (`convex/documents.ts`)

Cursor-based reactive pagination uses `paginationOptsValidator` from `"convex/server"` to scope documents to the user's active organization or personal workspace:

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

## 2. Direct Internal Lookup Query (`convex/documents.ts`)

The `getById` query provides direct document retrieval by document ID:

```typescript
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})
```

- **No Caller Auth Guard**: Intentionally avoids caller authentication guards so that internal server-side callers (e.g. `ConvexHttpClient` in `/api/liveblocks-auth`) can fetch document metadata to perform downstream authorization checks.
- **Client Caution**: Client components must not use `getById` as a substitute for authorized endpoints.
