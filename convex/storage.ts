import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireAuth } from "./lib/auth"

/**
 * Generates a short-lived upload URL for storing a file in Convex storage.
 * Requires authentication.
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Resolves a storage ID to a public serving URL.
 * Returns `null` if the storage ID is invalid or the file has been deleted.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})
