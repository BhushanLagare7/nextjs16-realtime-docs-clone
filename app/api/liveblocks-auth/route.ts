import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { ConvexHttpClient } from "convex/browser"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const liveblocks = new Liveblocks({
  secret: (process.env.LIVEBLOCKS_SECRET_KEY as string) || "sk_placeholder",
})

/**
 * Saturated, accessible collaborator color palette (>= 4.5:1 contrast against white cursor labels).
 */
const COLLABORATOR_COLORS = [
  "#2563eb", // Blue (5.17:1)
  "#dc2626", // Red (4.83:1)
  "#15803d", // Green (5.02:1)
  "#b45309", // Amber (5.02:1)
  "#7c3aed", // Violet (5.70:1)
  "#db2777", // Pink (4.60:1)
  "#0e7490", // Cyan (5.36:1)
  "#c2410c", // Orange (5.18:1)
]

/**
 * Deterministically generates a consistent collaborator color from a user ID.
 */
function generateUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash |= 0
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length]
}

/**
 * Liveblocks auth endpoint. Verifies the requesting Clerk user has access
 * (as owner or organization member) to the requested document/room before
 * authorizing a write-capable collaboration session.
 */
export async function POST(req: Request) {
  const { orgId, sessionClaims, getToken } = await auth()
  if (!sessionClaims) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await currentUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { room } = (await req.json()) as { room?: string }
  if (!room) {
    return new Response("Unauthorized", { status: 401 })
  }

  const token = await getToken({ template: "convex" })
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Fetch the document backing the requested room to check access rights.
  let document = null
  try {
    convex.setAuth(token)
    document = await convex.query(api.documents.getById, {
      id: room as Id<"documents">,
    })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!document) {
    return new Response("Unauthorized", { status: 401 })
  }

  const isOwner = document.ownerId === user.id
  const sessionOrgId = (sessionClaims as Record<string, unknown>).org_id as
    string | undefined
  let isOrganizationMember = !!(
    document.organizationId &&
    (document.organizationId === sessionOrgId ||
      document.organizationId === orgId)
  )

  // Fallback: verify org membership via Clerk API if session claims are stale/missing.
  if (!isOwner && !isOrganizationMember && document.organizationId) {
    try {
      const clerk = await clerkClient()
      const limit = 100
      let offset = 0
      let hasMore = true

      while (hasMore && !isOrganizationMember) {
        const memberships = await clerk.users.getOrganizationMembershipList({
          userId: user.id,
          limit,
          offset,
        })

        isOrganizationMember = memberships.data.some(
          (membership) => membership.organization.id === document.organizationId
        )

        offset += memberships.data.length
        hasMore = offset < memberships.totalCount && memberships.data.length > 0
      }
    } catch {
      // Membership lookup fallback gracefully ignores errors and preserves isOrganizationMember state
    }
  }

  if (!isOwner && !isOrganizationMember) {
    return new Response("Unauthorized", { status: 401 })
  }

  const name =
    user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous"

  // Grant write access to the room and issue the Liveblocks session token.
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name,
      avatar: user.imageUrl,
      color: generateUserColor(user.id),
    },
  })
  session.allow(room, ["*:write"])
  const { body, status } = await session.authorize()

  return new Response(body, { status })
}
