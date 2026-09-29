import type { UserIdentity } from "convex/server"
import { ConvexError } from "convex/values"

import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

/**
 * Authenticated user context containing the raw identity, subject ID, and optional organization ID.
 */
export interface AuthenticatedUser {
  user: UserIdentity
  userId: string
  organizationId: string | undefined
}

/**
 * Asserts that the caller is authenticated and returns their identity and active organization ID.
 * Throws ConvexError("Unauthorized") if unauthenticated.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  const user = await ctx.auth.getUserIdentity()

  if (!user) {
    throw new ConvexError("Unauthorized")
  }

  const organizationId = (user.organization_id ?? undefined) as
    string | undefined

  return {
    user,
    userId: user.subject,
    organizationId,
  }
}

/**
 * Checks whether an authenticated user has ownership or org-membership access to a document.
 */
export function hasDocumentAccess(
  document: Doc<"documents">,
  user: AuthenticatedUser
): boolean {
  const isOwner = document.ownerId === user.userId
  const isOrganizationMember = Boolean(
    document.organizationId && document.organizationId === user.organizationId
  )
  return isOwner || isOrganizationMember
}

/**
 * Retrieves a document by ID and verifies that the authenticated caller has access to it.
 * Throws ConvexError("Document not found") if the document does not exist,
 * or ConvexError("Unauthorized") if the caller lacks access.
 */
export async function requireDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  id: Id<"documents">,
  authenticatedUser?: AuthenticatedUser
): Promise<{
  document: Doc<"documents">
  user: AuthenticatedUser
}> {
  const user = authenticatedUser ?? (await requireAuth(ctx))
  const document = await ctx.db.get(id)

  if (!document) {
    throw new ConvexError("Document not found")
  }

  if (!hasDocumentAccess(document, user)) {
    throw new ConvexError("Unauthorized")
  }

  return { document, user }
}
