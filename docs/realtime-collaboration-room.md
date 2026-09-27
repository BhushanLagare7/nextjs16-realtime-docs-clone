# Real-Time Multiplayer Room & Presence

This document outlines the real-time multiplayer architecture, Liveblocks room configuration, presence awareness, and collaborative comment threads.

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
// app/room.tsx
"use client"

import type { ReactNode } from "react"
import { useParams } from "next/navigation"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { FullscreenLoader } from "@/components/fullscreen-loader"

export function Room({
  children,
  roomId,
}: {
  children: ReactNode
  roomId?: string
}) {
  const params = useParams<{ documentId: string }>()
  const id = roomId ?? params?.documentId ?? ""

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider id={id} initialPresence={{ cursor: null }}>
        <ClientSideSuspense
          fallback={<FullscreenLoader label="Document loading…" />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
```

---

## 2. Multiplayer Presence & Cursors

- **Cursor Sync**: Real-time cursor coordinates and text selections broadcast via `useMyPresence()` and `useOthers()`.
- **User Colors**: Deterministically map each user's ID to a vibrant color palette so cursors and comment avatars remain consistent across refreshes.
- **Collaborator Avatars**: Display active room participants in the document navbar with status tooltips.

---

## 3. Collaborative Comments & Threads

Collaborative comment threads, connection gating with `useStatus()`, localized suspense, and the responsive thread layout pattern are documented in [`docs/realtime-collaboration-threads.md`](realtime-collaboration-threads.md).
