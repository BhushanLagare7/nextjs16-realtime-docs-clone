# Real-Time Multiplayer Room & Presence

This document outlines the real-time multiplayer architecture, Liveblocks room configuration, presence awareness, and collaborative comment threads.

---

## 1. Liveblocks Architecture & Room Wrapper

Multiplayer synchronization is powered by Liveblocks, wrapping the entire document page (including navbar, toolbar, and editor) to enable room presence and collaborator avatars everywhere.

```
┌────────────────────────────────────────────────────────┐
│        Room Component (app/.../[documentId]/room.tsx)  │
│   ┌────────────────────────────────────────────────┐   │
│   │   LiveblocksProvider (Users & Mentions)        │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │   RoomProvider (Document Room)         │   │   │
│   │   │   ┌────────────────────────────────┐   │   │   │
│   │   │   │ Navbar (Avatars Stack)         │   │   │   │
│   │   │   │ Toolbar                        │   │   │   │
│   │   │   │ ┌────────────────────────────┐ │   │   │   │
│   │   │   │ │ ClientSideSuspense         │ │   │   │   │
│   │   │   │ │ └─ Document Editor (Tiptap)│ │   │   │   │
│   │   │   │ └────────────────────────────┘ │   │   │   │
│   │   │   └────────────────────────────────┘   │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Room Wrapper Pattern (`app/documents/[documentId]/room.tsx`)

- **Root Page Wrapper**: `DocumentIdPage` wraps the entire page hierarchy in `<Room key={documentId} roomId={documentId}>` so Navbar and Editor share room context. Re-exported by `app/room.tsx` for backwards compatibility.
- **Scoped Suspense Boundary**: `ClientSideSuspense` wraps only descendants that require Liveblocks data (`DocumentEditor`), rendering `Navbar` and `Toolbar` outside the loading boundary so they remain visible while the editor loads.
- **User Directory Fetching**: Calls the `getUsers(documentId)` Server Action (`actions.ts`), checking document access via Convex `api.documents.getById` and paginating all members of the target organization.
- **User, Room & Mention Resolution**:
  - `resolveUsers({ userIds })`: Asynchronously awaits directory loading before mapping IDs to `{ name, avatar }` to prevent caching `undefined` results.
  - `resolveMentionSuggestions({ text })`: Filters organization members by matching substring in mentions.
  - `resolveRoomsInfo({ roomIds })`: Batches document IDs via `getDocuments(ids)` server action (`api.documents.getByIds`) to resolve document titles for cross-room notifications.
  - **Cache Invalidation**: `DirectoryCacheInvalidator` triggers `client.resolvers.invalidateUsers()` and `client.resolvers.invalidateMentionSuggestions()` whenever loaded directory users change.

---

## 2. Collaborator Avatars & Presence Stack (`avatars.tsx`)

- **Avatar Stack (`app/documents/[documentId]/avatars.tsx`)**:
  - Consumes `useOthers()` and `useSelf()` from `@liveblocks/react/suspense`.
  - Renders current user ("You") alongside active collaborators in an overlapping negative-margin stack (`-ml-2`). Even when `useOthers()` is empty, the current user avatar is rendered.
  - Separator is shown only when collaborator avatars (`users.length > 0`) are present.
  - Wrapped in `<ClientSideSuspense fallback={null}>` to prevent layout shift while connection initializes.
  - Features CSS hover tooltip displaying collaborator names (`group-hover:opacity-100`).
  - Follows semantic token styling (`border-background bg-muted text-background bg-foreground`).
- **Presence & Cursors**:
  - Real-time cursor coordinates and text selections broadcast via `useMyPresence()` and `useOthers()`.
  - Collaborator cursors styled with dual-surface contrast (`#ffffff` cursor text labels).
  - In `liveblocks.config.ts`, `UserMeta["info"]["color"]` is optional (`color?: string`) to support both directory-resolved and session-generated users.

---

## 3. Collaborative Comments & Threads

Collaborative comment threads, connection gating with `useStatus()`, localized suspense, and the responsive thread layout pattern are documented in [`docs/realtime-collaboration-threads.md`](realtime-collaboration-threads.md).
