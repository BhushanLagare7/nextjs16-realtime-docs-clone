# Collaborative Comments & Threads

This document details the collaborative comments and threads architecture integrating Liveblocks with Tiptap.

---

## 1. Tiptap Comments Integration

Multiplayer comment threads are integrated using `@liveblocks/react-ui` and `@liveblocks/react-tiptap` (`useLiveblocksExtension`).

- **Connection-State Guard (`useStatus`)**: Invoking `useThreads()` before the room WebSocket connection is active (`status === "connected"`) triggers a REST call to an uninitialized room, resulting in an `HttpError: 403 UNAUTHORIZED_ROOM_ACCESS`. Always gate thread fetching behind `status === "connected"`.
- **Localized Suspense Boundary**: Wrap thread rendering in `<ClientSideSuspense fallback={null}>` to prevent thread loading states from bubbling up to the document-level fallback loader.
- **Responsive Threads Layout**: Style desktop threads with `.anchored-threads` (`@apply absolute top-4 left-full ml-4 block w-75 max-sm:hidden`) positioned outside the centered editor page to keep the editor canvas and ruler strictly aligned without text overlap, and mobile threads with `.floating-threads` (`@apply hidden max-sm:block`).
- **Composer Reconnect Persistence**: `FloatingComposer` is mounted upon the initial `connected` status and persists across network reconnects via a persistent connection flag, while `ThreadsList` remains gated on active connection.

---

## 2. Implementation Pattern (`threads.tsx`)

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
