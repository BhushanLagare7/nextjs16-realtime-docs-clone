import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"

import { mutation, query } from "./_generated/server"

/** Creates a new document. */
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

/**
 * Returns a paginated list of documents, filtered by search term and/or
 * scoped to the caller's organization (falling back to personal documents).
 */
export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, search }) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError("Unauthorized")
    }

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

/** Deletes a document by ID. Requires ownership or org membership. */
export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError("Unauthorized")
    }

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined

    const document = await ctx.db.get(args.id)

    if (!document) {
      throw new ConvexError("Document not found")
    }

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

/** Updates a document's title. Requires ownership or org membership. */
export const updateById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw new ConvexError("Unauthorized")
    }

    const organizationId = (user.organization_id ?? undefined) as
      string | undefined

    const document = await ctx.db.get(args.id)

    if (!document) {
      throw new ConvexError("Document not found")
    }

    const isOwner = document.ownerId === user.subject
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    )

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized")
    }

    return await ctx.db.patch(args.id, { title: args.title })
  },
})

/** Returns a document by ID, or `null` if not found. No auth check (used internally, e.g. by the Liveblocks auth route). */
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})
