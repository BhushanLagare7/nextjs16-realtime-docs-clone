# Architecture & Tech Stack Overview

This document defines the high-level system architecture and technology stack for the **Real-Time Collaborative Document Editor**.

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
- **Lucide React** & **React Icons**: Primary icon libraries (`lucide-react` for standard UI chrome, `react-icons` for specialized format/caret icons like `BsFilePdf`, `FaCaretDown`)
- **Class Variance Authority (`cva`)** & **`tailwind-merge`**: Component variants and className composition

### Document Editor & Extensions

- **Tiptap**: `^3.x` (Headless rich-text editor engine)
  - `@tiptap/react`, `@tiptap/starter-kit`
  - Core & specialized extensions: `StarterKit` (bundles `Bold`, `Italic`, `Underline`, `Strike`, `Heading`, etc.), `Color`, `FontFamily`, `Highlight`, `Image`, `Link`, `Table`, `TableCell`, `TableHeader`, `TableRow`, `TaskItem`, `TaskList`, `TextStyle`
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

- **Clerk**: `^6.x` (`@clerk/nextjs@^6.12.0`, `@clerk/themes@^2.2.20`)
  - User authentication, organization/workspace switching, and profile avatar sync

### State Management & URL Coordination

- **Zustand**: Lightweight global state for the active editor instance (`use-editor-store.ts`)
- **nuqs**: Type-safe URL query state management (e.g. search, pagination, active modal state)
