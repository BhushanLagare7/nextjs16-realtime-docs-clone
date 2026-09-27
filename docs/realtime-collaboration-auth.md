# Liveblocks Authentication & Protected Boundaries

This document details the server-side authentication route handler and multiplayer architecture protection boundaries.

---

## 1. Authentication Route (`/api/liveblocks-auth`)

Liveblocks room access is authorized server-side via a Next.js 16 route handler integrated with Clerk:

1. **Session Verification**: Call `auth()` and `currentUser()` from `@clerk/nextjs/server`.
2. **Access Control**: Obtain a Convex-compatible Clerk token via `getToken({ template: "convex" })`, authenticate `ConvexHttpClient` via `convex.setAuth(token)`, and look up the document via `convex.query(api.documents.getById, { id: room })`. Authorize document owner (`document.ownerId === user.id`) or organization members.
3. **Clerk Org Fallback**: If session claims lack `org_id`, paginate `clerkClient().users.getOrganizationMembershipList({ userId: user.id })` to verify membership across all user organizations before denying access.
4. **Deterministic Color Hashing**: Hash `user.id` using a djb2 algorithm into an 8-color collaborator palette (>= 4.5:1 contrast against white cursor labels) for consistent presence cursors.
5. **Session Authorization**: Authorize the session with `liveblocks.prepareSession()`, grant write permissions with `session.allow(room, ["*:write"])`, and return `{ body, status }`:

```typescript
// app/api/liveblocks-auth/route.ts
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { Liveblocks } from "@liveblocks/node"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function POST(req: Request) {
  const { orgId, sessionClaims, getToken } = await auth()
  if (!sessionClaims) return new Response("Unauthorized", { status: 401 })

  const user = await currentUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { room } = (await req.json()) as { room?: string }
  if (!room) return new Response("Unauthorized", { status: 401 })

  const token = await getToken({ template: "convex" })
  if (!token) return new Response("Unauthorized", { status: 401 })

  let document = null
  try {
    convex.setAuth(token)
    document = await convex.query(api.documents.getById, {
      id: room as Id<"documents">,
    })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!document) return new Response("Unauthorized", { status: 401 })

  const isOwner = document.ownerId === user.id
  const sessionOrgId = (sessionClaims as Record<string, unknown>).org_id as
    string | undefined
  let isOrgMember = !!(
    document.organizationId &&
    (document.organizationId === sessionOrgId ||
      document.organizationId === orgId)
  )

  if (!isOwner && !isOrgMember && document.organizationId) {
    try {
      const clerk = await clerkClient()
      const limit = 100
      let offset = 0
      let hasMore = true

      while (hasMore && !isOrgMember) {
        const memberships = await clerk.users.getOrganizationMembershipList({
          userId: user.id,
          limit,
          offset,
        })
        isOrgMember = memberships.data.some(
          (m) => m.organization.id === document.organizationId
        )
        offset += memberships.data.length
        hasMore = offset < memberships.totalCount && memberships.data.length > 0
      }
    } catch {}
  }

  if (!isOwner && !isOrgMember)
    return new Response("Unauthorized", { status: 401 })

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name:
        user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
      avatar: user.imageUrl,
      color: generateUserColor(user.id),
    },
  })
  session.allow(room, ["*:write"])
  const { body, status } = await session.authorize()
  return new Response(body, { status })
}
```

---

## 2. Protected Boundaries

> [!WARNING]
> Any changes to `liveblocks.config.ts`, `app/api/liveblocks-auth/route.ts`, or `room.tsx` directly impact the multiplayer collaboration contract. Always verify real-time presence across multiple browser tabs after editing these files.
