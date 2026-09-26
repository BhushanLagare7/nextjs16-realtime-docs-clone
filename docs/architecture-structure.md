# Directory Layout & Architectural Boundaries

This document defines the project directory structure, file organization, Server vs. Client component boundaries, and state separation rules for the **Real-Time Collaborative Document Editor**.

---

## 1. Directory Layout

The project follows a standard Next.js App Router structure:

```
nextjs16-realtime-docs-clone/
├── .agents/                # Local agent skills and configurations
├── app/                    # Next.js App Router pages, layouts, and API routes
│   ├── (home)/             # Document listing, search, templates gallery
│   ├── api/
│   │   └── liveblocks-auth/# Liveblocks authentication endpoint
│   ├── documents/
│   │   └── [documentId]/   # Document editor workspace, navbar, toolbar, ruler, room
│   ├── globals.css         # Global styles and Tailwind v4 theme definitions
│   └── layout.tsx          # Root layout with font and theme providers
├── components/             # Reusable UI components
│   ├── toolbar/            # Document editor toolbar controls
│   ├── ui/                 # shadcn/ui primitive components
│   ├── convex-client-provider.tsx # Convex client provider
│   ├── remove-dialog.tsx   # Shared document deletion confirmation dialog
│   ├── rename-dialog.tsx   # Shared document rename dialog
│   └── theme-provider.tsx  # Next-themes provider
├── constants/              # Application-wide static constants (fonts, margins)
├── convex/                 # Convex backend schema, queries, mutations
├── docs/                   # Modular convention documentation
├── extensions/             # Custom Tiptap editor extensions
├── hooks/                  # Reusable custom hooks (e.g., debounce, mobile check)
├── lib/                    # Shared utility functions (`cn()`)
├── public/                 # Static assets (favicons, SVG logos)
├── store/                  # Zustand stores (`use-editor-store.ts`)
└── types/                  # Shared TypeScript types and interfaces
```

---

## 2. Architectural Boundaries

### Server vs. Client Components

1. **Server Components by default**:
   - Layouts, static page shells, and non-interactive data containers must remain Server Components.
2. **Client Components (`"use client"`)**:
   - Apply only at interactive leaves: the Tiptap editor canvas, toolbar controls, dialogs, Liveblocks room wrappers, and reactive Convex query consumers.
   - Never make an entire page client-side if a shell or layout can be server-rendered.

### State Separation

- **Document Content**: Managed by Tiptap and synced via Liveblocks CRDT data channels.
- **Document Metadata**: (Title, owner, orgId, updated timestamp) Managed by Convex.
- **Editor UI State**: (Active editor reference, page margins, selection marks, font sizes) Managed by Zustand (`use-editor-store`).
- **URL / Navigation State**: Managed via `nuqs` or Next.js navigation hooks.
