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

- **Tiptap Integration**: Integrated using `@liveblocks/react-ui` and `@liveblocks/react-tiptap` (`useLiveblocksExtension`).
- **Connection-State Guard (`useStatus`)**: Invoking `useThreads()` before the room WebSocket connection is active (`status === "connected"`) triggers a REST call to an uninitialized room, resulting in an `HttpError: 403 UNAUTHORIZED_ROOM_ACCESS` when using public API keys. Always gate thread fetching behind `status === "connected"`.
- **Localized Suspense Boundary**: Wrap thread rendering in `<ClientSideSuspense fallback={null}>` to prevent thread loading states from bubbling up to the document-level fallback loader.
- **Responsive Threads Layout**: Style desktop threads with `.anchored-threads` (`@apply absolute top-4 left-full ml-4 block w-75 max-sm:hidden`) positioned outside the centered editor page to keep the editor canvas and ruler strictly aligned without text overlap, and mobile threads with `.floating-threads` (`@apply hidden max-sm:block`).
- **Composer Reconnect Persistence**: `FloatingComposer` is mounted upon the initial `connected` status and persists across network reconnects via a persistent connection flag, while `ThreadsList` remains gated on active connection.

```tsx
// app/documents/[documentId]/threads.tsx
"use client"
import { useState } from "react"
import {
  AnchoredThreads,
  FloatingComposer,
  FloatingThreads,
} from "@liveblocks/react-tiptap"
import {
  ClientSideSuspense,
  useStatus,
  useThreads,
} from "@liveblocks/react/suspense"
import type { Editor } from "@tiptap/react"
function ThreadsList({ editor }: { editor: Editor | null }) {
  const { threads } = useThreads({ query: { resolved: false } })

  return (
    <>
      <div className="anchored-threads">
        <AnchoredThreads editor={editor} threads={threads} />
      </div>
      <FloatingThreads
        className="floating-threads"
        editor={editor}
        threads={threads}
      />
    </>
  )
}

export function Threads({ editor }: { editor: Editor | null }) {
  const status = useStatus()
  const [hasConnected, setHasConnected] = useState(false)
  if (status === "connected" && !hasConnected) setHasConnected(true)

  return (
    <ClientSideSuspense fallback={null}>
      {status === "connected" ? <ThreadsList editor={editor} /> : null}
      {hasConnected ? (
        <FloatingComposer className="floating-composer" editor={editor} />
      ) : null}
    </ClientSideSuspense>
  )
}
```
