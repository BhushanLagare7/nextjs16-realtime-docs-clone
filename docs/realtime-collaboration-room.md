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
│   │   │   │ ClientSideSuspense             │   │   │   │
│   │   │   │ ┌────────────────────────────┐ │   │   │   │
│   │   │   │ │ Navbar (Avatars Stack)     │ │   │   │   │
│   │   │   │ │ Toolbar                    │ │   │   │   │
│   │   │   │ │ Document Editor (Tiptap)   │ │   │   │   │
│   │   │   │ └────────────────────────────┘ │   │   │   │
│   │   │   └────────────────────────────────┘   │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Room Wrapper Pattern (`app/documents/[documentId]/room.tsx`)

- **Root Page Wrapper**: `DocumentIdPage` wraps the entire page hierarchy in `<Room key={documentId} roomId={documentId}>` so Navbar and Editor share room context. Re-exported by `app/room.tsx` for backwards compatibility.
- **User Directory Fetching**: On mount, calls the `getUsers()` Server Action (`actions.ts`) to fetch Clerk organization members via `clerk.users.getUserList({ organizationId })`.
- **User & Mention Resolution**:
  - `resolveUsers({ userIds })`: Maps IDs to `{ name, avatar }` from the organization user pool for threads and presence.
  - `resolveMentionSuggestions({ text })`: Filters organization members by matching substring in mentions.

---

## 2. Collaborator Avatars & Presence Stack (`avatars.tsx`)

- **Avatar Stack (`app/documents/[documentId]/avatars.tsx`)**:
  - Consumes `useOthers()` and `useSelf()` from `@liveblocks/react/suspense`.
  - Renders current user ("You") alongside active collaborators in an overlapping negative-margin stack (`-ml-2`).
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
