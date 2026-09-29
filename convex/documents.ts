import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import {
  hasDocumentAccess,
  requireAuth,
  requireDocumentAccess,
} from "./lib/auth"

/** Creates a new document owned by the authenticated user. */
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = await requireAuth(ctx)

    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled document",
      ownerId: userId,
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
    const { organizationId, userId } = await requireAuth(ctx)

    // Search within the caller's organization.
    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("organizationId", organizationId)
        )
        .paginate(paginationOpts)
    }

    // Search within the caller's personal documents.
    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("ownerId", userId)
        )
        .paginate(paginationOpts)
    }

    // List all documents belonging to the caller's organization.
    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .order("desc")
        .paginate(paginationOpts)
    }

    // List the caller's personal documents.
    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", userId))
      .order("desc")
      .paginate(paginationOpts)
  },
})

/** Deletes a document by ID. Requires ownership or org membership. */
export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await requireDocumentAccess(ctx, args.id)
    return await ctx.db.delete(args.id)
  },
})

/** Updates a document's title. Requires ownership or org membership. */
export const updateById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    await requireDocumentAccess(ctx, args.id)
    return await ctx.db.patch(args.id, { title: args.title })
  },
})

/** Returns a document by ID if the caller owns it or has access through its organization. */
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const { document } = await requireDocumentAccess(ctx, id)
    return document
  },
})

/**
 * Returns a list of document IDs and names for batch room resolution.
 * Documents the caller cannot access are returned with a "[Removed]" name.
 */
export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const auth = await requireAuth(ctx)
    const documents = []

    for (const id of ids) {
      const document = await ctx.db.get(id)

      if (document && hasDocumentAccess(document, auth)) {
        documents.push({ id: document._id, name: document.title })
      } else {
        documents.push({ id, name: "[Removed]" })
      }
    }

    return documents
  },
})
