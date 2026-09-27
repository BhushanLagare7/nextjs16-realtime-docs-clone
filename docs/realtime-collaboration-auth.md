# Liveblocks Authentication & Protected Boundaries

This document details the server-side authentication route handler and multiplayer architecture protection boundaries.

---

## 1. Authentication Route (`/api/liveblocks-auth`)

Liveblocks room access is authorized server-side via a Next.js 16 route handler integrated with Clerk:

1. **Session Verification**: Call `auth()` and `currentUser()` from `@clerk/nextjs/server`.
2. **Access Control**: Look up the document via `convex.query(api.documents.getById, { id: room })`. Authorize document owner (`document.ownerId === user.id`) or organization members.
3. **Clerk Org Fallback**: If session claims lack `org_id`, query `clerkClient().users.getOrganizationMembershipList({ userId: user.id })` to verify membership before denying access.
4. **Deterministic Color Hashing**: Hash `user.id` using a djb2 algorithm into an 8-color collaborator palette for consistent presence cursors.
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
  const { orgId, sessionClaims } = await auth()
  const user = await currentUser()
  if (!sessionClaims || !user)
    return new Response("Unauthorized", { status: 401 })

  const { room } = (await req.json()) as { room?: string }
  if (!room) return new Response("Unauthorized", { status: 401 })

  const document = await convex
    .query(api.documents.getById, {
      id: room as Id<"documents">,
    })
    .catch(() => null)
  if (!document) return new Response("Unauthorized", { status: 401 })

  const isOwner = document.ownerId === user.id
  let isOrgMember = !!(
    document.organizationId &&
    (document.organizationId === sessionClaims.org_id ||
      document.organizationId === orgId)
  )

  if (!isOwner && !isOrgMember && document.organizationId) {
    try {
      const clerk = await clerkClient()
      const memberships = await clerk.users.getOrganizationMembershipList({
        userId: user.id,
      })
      isOrgMember = memberships.data.some(
        (m) => m.organization.id === document.organizationId
      )
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
