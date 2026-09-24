# Architecture & Tech Stack

This document defines the high-level system architecture, technology stack, directory organization, and component boundaries for the **Real-Time Collaborative Document Editor**.

---

## 1. High-Level Overview

The application is a full-featured, collaborative document editor (inspired by Google Docs). Users can create, edit, organize, format, and share rich-text documents with real-time multiplayer collaboration (concurrent edits, presence cursors, comments).

```
┌────────────────────────────────────────────────────────┐
│               Client Browser (React 19)                │
├───────────────────────┬────────────────────────────────┤
│   Tiptap Editor UI    │    Liveblocks Room Provider    │
│  (Canvas, Toolbar,    │ (CRDT Sync, Multi-user Cursors,│
│   Ruler, Extensions)  │   Threads, Active Presence)    │
└───────────┬───────────┴───────────────┬────────────────┘
            │                           │ WebSocket
            │ Next.js 16 API Routes     │
┌───────────▼───────────────────────────▼────────────────┐
│           Next.js 16 Server / Clerk Auth API           │
│         - Liveblocks Auth (/api/liveblocks-auth)       │
│         - Organization & Session Validation            │
└───────────────────────┬────────────────────────────────┘
                        │ Reactive Protocol
┌───────────────────────▼────────────────────────────────┐
│            Convex Reactive Backend Database            │
│   - Document Metadata, Permissions, Org Multitenancy   │
│   - Reactive Realtime Queries & Atomic Mutations       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Core Framework & Runtime

- **Next.js**: `16.x` (App Router, Server Components, Route Handlers)
- **React**: `19.x` (Actions, Server Components, React 19 Hooks)
- **TypeScript**: `^5` (Strict type checking enabled)

### Styling & Design System

- **Tailwind CSS**: `^4` (configured with `@tailwindcss/postcss`)
- **shadcn/ui**: Accessible component library built on Radix UI primitives
- **Lucide React**: Primary UI icon library
- **Class Variance Authority (`cva`)** & **`tailwind-merge`**: Component variants and className composition

### Document Editor & Extensions

- **Tiptap**: `^3.x` (Headless rich-text editor engine)
  - `@tiptap/react`, `@tiptap/starter-kit`
  - Core & specialized extensions: `Color`, `FontFamily`, `Heading`, `Highlight`, `Image`, `Table`, `TableCell`, `TableHeader`, `TableRow`, `TaskItem`, `TaskList`, `TextStyle`, `Underline`
  - Custom extensions: Font size, line height, image resizer
- **Color Picker**: `react-colorful` (`HexColorPicker`, `HexColorInput`) integrated into Google Docs 80-swatch matrix popover

### Real-Time Multiplayer Collaboration

- **Liveblocks**: `^3.x`
  - `@liveblocks/client`, `@liveblocks/react`
  - `@liveblocks/react-tiptap`: CRDT binding between Tiptap and Liveblocks
  - `@liveblocks/react-ui`: Collaborative comment threads and inbox notifications

### Backend Database & Storage

- **Convex**: Reactive serverless database with real-time subscriptions, queries, and mutations
- Document metadata storage, organization scoping, and deletion/renaming flows

### Authentication & Multi-Tenancy

- **Clerk**: User authentication, organization/workspace switching, and profile avatar sync

### State Management & URL Coordination

- **Zustand**: Lightweight global state for the active editor instance (`use-editor-store.ts`)
- **nuqs**: Type-safe URL query state management (e.g. search, pagination, active modal state)

---

## 3. Directory Layout

The project follows a standard Next.js App Router structure:

```
nextjs16-realtime-docs-clone/
├── .agents/                # Local agent skills and configurations
├── app/                    # Next.js App Router pages, layouts, and API routes
│   ├── (home)/             # Document listing, search, templates gallery
│   ├── api/
│   │   └── liveblocks-auth/# Liveblocks authentication endpoint
│   ├── documents/
│   │   └── [documentId]/   # Document editor workspace, toolbar, ruler, room
│   ├── globals.css         # Global styles and Tailwind v4 theme definitions
│   └── layout.tsx          # Root layout with font and theme providers
├── components/             # Reusable UI components
│   ├── toolbar/            # Document editor toolbar controls
│   ├── ui/                 # shadcn/ui primitive components
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

## 4. Architectural Boundaries

### Server vs. Client Components

1. **Server Components by default**:
   - Layouts, static page shells, and non-interactive data containers must remain Server Components.
2. **Client Components (`"use client"`)**:
   - Apply only at interactive leaves: the Tiptap editor canvas, toolbar controls, dialogs, Liveblocks room wrappers, and reactive Convex query consumers.
   - Never make an entire page client-side if a shell or layout can be server-rendered.

### State Separation

- **Document Content**: Managed by Tiptap and synced via Liveblocks CRDT data channels.
- **Document Metadata**: (Title, owner, orgId, updated timestamp) Managed by Convex.
- **Editor UI State**: (Active editor reference, selection marks, font sizes) Managed by Zustand (`use-editor-store`).
- **URL / Navigation State**: Managed via `nuqs` or Next.js navigation hooks.
