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

## 2. Direct Document Lookup Query (`convex/documents.ts`)

The `getById` query provides direct document retrieval by document ID, enforcing identity authentication and dual-ownership authorization:

```typescript
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) throw new ConvexError("Unauthorized")

    const document = await ctx.db.get(id)
    if (!document) throw new ConvexError("Document not found")

    const isOwner = document.ownerId === user.subject
    const organizationId = (user.organization_id ?? undefined) as
      string | undefined
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    )

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized")
    }

    return document
  },
})
```

- **Enforced Access Contract**: Requires an authenticated identity (`ctx.auth.getUserIdentity()`). Returns the document only when the caller owns it (`ownerId === user.subject`) or has access through the document's organization (`document.organizationId === user.organization_id`). Throws `ConvexError("Unauthorized")` otherwise.
- **Server-Side Integration**: Callers using `ConvexHttpClient` (e.g. `/api/liveblocks-auth`, `app/documents/[documentId]/actions.ts`) must supply a Convex-compatible Clerk token (`convex.setAuth(token)`). When preloaded via `preloadQuery` in Next.js Server Components, catch `ConvexError` with `"Document not found"` and call `notFound()`, allowing all other errors to bubble.

---

## 3. Batch Document Resolution Query (`convex/documents.ts`)

The `getByIds` query batch-resolves document IDs into ID-title pairs for Liveblocks room info resolution, preserving array order:

```typescript
export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const documents = []
    for (const id of ids) {
      const document = await ctx.db.get(id)
      documents.push(
        document
          ? { id: document._id, name: document.title }
          : { id, name: "[Removed]" }
      )
    }
    return documents
  },
})
```
