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

## 2. Multiplayer Presence & Cursors

- **Cursor Sync**: Real-time cursor coordinates and text selections broadcast via `useMyPresence()` and `useOthers()`.
- **User Colors**: Deterministically map each user's ID to a vibrant color palette so cursors and comment avatars remain consistent across refreshes.
- **Collaborator Avatars**: Display active room participants in the document navbar with status tooltips.

---

## 3. Collaborative Comments & Threads

- Integrated using `@liveblocks/react-ui` and `@liveblocks/react-tiptap`.
- Threads are bound to document selections.
- Do not modify thread container styles directly; use Liveblocks UI theme CSS variables in `app/globals.css`.
