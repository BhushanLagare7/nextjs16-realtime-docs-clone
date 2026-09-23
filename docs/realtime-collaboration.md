# Real-Time Collaboration & Liveblocks Conventions

This document outlines the real-time multiplayer architecture, Liveblocks room configuration, presence awareness, authentication, and comment threads.

---

## 1. Liveblocks Architecture

Multiplayer synchronization is powered by Liveblocks, integrating with Tiptap via CRDT bindings.

```
┌────────────────────────────────────────────────────────┐
│            Room Component (room.tsx)                   │
│   ┌────────────────────────────────────────────────┐   │
│   │           Liveblocks RoomProvider              │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │          ClientSideSuspense            │   │   │
│   │   │   ┌────────────────────────────────┐   │   │   │
│   │   │   │        Document Editor         │   │   │   │
│   │   │   │ (Tiptap + Cursors + Comments)  │   │   │   │
│   │   │   └────────────────────────────────┘   │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Room Wrapper Pattern

```tsx
// app/documents/[documentId]/room.tsx
"use client"

import { ReactNode } from "react"
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react"
import { FullscreenLoader } from "@/components/fullscreen-loader"

export function Room({
  children,
  roomId,
}: {
  children: ReactNode
  roomId: string
}) {
  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense
        fallback={<FullscreenLoader label="Connecting to room..." />}
      >
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
```

---

## 2. Authentication Route (`/api/liveblocks-auth`)

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

## 3. Multiplayer Presence & Cursors

- **Cursor Sync**: Real-time cursor coordinates and text selections broadcast via `useMyPresence()` and `useOthers()`.
- **User Colors**: Deterministically map each user's ID to a vibrant color palette so cursors and comment avatars remain consistent across refreshes.
- **Collaborator Avatars**: Display active room participants in the document navbar with status tooltips.

---

## 4. Collaborative Comments & Threads

- Integrated using `@liveblocks/react-ui` and `@liveblocks/react-tiptap`.
- Threads are bound to document selections.
- Do not modify thread container styles directly; use Liveblocks UI theme CSS variables in `app/globals.css`.

---

## 5. Protected Boundaries

> [!WARNING]
> Any changes to `liveblocks.config.ts`, `app/api/liveblocks-auth/route.ts`, or `room.tsx` directly impact the multiplayer collaboration contract. Always verify real-time presence across multiple browser tabs after editing these files.
