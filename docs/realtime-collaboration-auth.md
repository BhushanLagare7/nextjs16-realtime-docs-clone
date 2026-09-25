# Liveblocks Authentication & Protected Boundaries

This document details the server-side authentication route handler and multiplayer architecture protection boundaries.

---

## 1. Authentication Route (`/api/liveblocks-auth`)

Liveblocks room access is authorized server-side via a Next.js 16 route handler integrated with Clerk:

1. **Session Verification**: Call `auth()` and `currentUser()` from `@clerk/nextjs/server`.
2. **Access Control**: Verify user belongs to the document's organization or has shared access.
3. **Session Identification**: Identify the user session on Liveblocks:
   ```typescript
   // app/api/liveblocks-auth/route.ts
   import { Liveblocks } from "@liveblocks/node"
   import { auth, currentUser } from "@clerk/nextjs/server"

   const liveblocks = new Liveblocks({
     secret: process.env.LIVEBLOCKS_SECRET_KEY!,
   })

   export async function POST(request: Request) {
     const { sessionClaims } = await auth()
     const user = await currentUser()

     if (!sessionClaims || !user) {
       return new Response("Unauthorized", { status: 401 })
     }

     const { room } = await request.json()

     // Resolve room to document and verify organization or owner access
     const document = await getDocument(room)
     if (!document) {
       return new Response("Unauthorized", { status: 401 })
     }

     const isOwner = document.ownerId === user.id
     const isOrgMember =
       document.organizationId &&
       document.organizationId === (sessionClaims.org_id as string | undefined)

     if (!isOwner && !isOrgMember) {
       return new Response("Unauthorized", { status: 401 })
     }

     const session = liveblocks.prepareSession(user.id, {
       userInfo: {
         name: user.fullName || "Anonymous",
         avatar: user.imageUrl,
         color: generateUserColor(user.id),
       },
     })

     session.allow(room, session.FULL_ACCESS)
     const { status, body } = await session.authorize()
     return new Response(body, { status })
   }
   ```

---

## 2. Protected Boundaries

> [!WARNING]
> Any changes to `liveblocks.config.ts`, `app/api/liveblocks-auth/route.ts`, or `room.tsx` directly impact the multiplayer collaboration contract. Always verify real-time presence across multiple browser tabs after editing these files.
