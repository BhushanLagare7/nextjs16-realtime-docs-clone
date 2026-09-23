<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — nextjs16-realtime-docs-clone

Real-time collaborative document editor (Google Docs clone) built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Tiptap**, **Liveblocks**, and **Convex**.

---

## Non-Negotiable Core Invariants

You MUST adhere to these critical rules across all tasks without exception:

1. **Pre-Commit Verification**: Always run `npm run format:check && npm run lint && npm run typecheck` before completing any task.
2. **Next.js 16 Async Route Params**: Dynamic route `params` and `searchParams` are Promises — always `await` them (`const { documentId } = await params`).
3. **Strict Type Safety**: Zero `any` policy. Never use `@ts-ignore` or `@ts-nocheck`. Fix underlying types.
4. **Protected Files**: NEVER modify `.env.local`, `next.config.ts`, `tsconfig.json`, `.gitignore`, `postcss.config.mjs`, or `components.json` without explicit user instruction.
5. **Tiptap Node Attributes**: Never apply block attributes (e.g., `lineHeight`, `textAlign`) to inline text nodes.

---

## Documentation Router

Detailed architecture guides and conventions have been modularized in the `docs/` directory to save context tokens. **Read the relevant document before writing code in that domain:**

| Topic                     | Document                                                               | When to Consult                                                                                 |
| :------------------------ | :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Architecture & Stack**  | [`docs/architecture.md`](docs/architecture.md)                         | High-level system design, tech stack versions, directory layout, or client/server boundaries    |
| **Code Style & Types**    | [`docs/code-conventions.md`](docs/code-conventions.md)                 | ESLint 7-group import sorting, JSX prop ordering, Prettier, TypeScript strictness, or `cn()`    |
| **Next.js 16 & React 19** | [`docs/nextjs-react-conventions.md`](docs/nextjs-react-conventions.md) | App Router pages/layouts, async params, Server vs Client components, or React 19 hooks/actions  |
| **Editor & Tiptap**       | [`docs/editor-tiptap.md`](docs/editor-tiptap.md)                       | Tiptap extensions, ProseMirror schema, toolbar controls, ruler math, or custom marks/extensions |
| **Multiplayer Realtime**  | [`docs/realtime-collaboration.md`](docs/realtime-collaboration.md)     | Liveblocks room setup, presence cursors, `/api/liveblocks-auth`, or comment threads             |
| **Database & Backend**    | [`docs/database-conventions.md`](docs/database-conventions.md)         | Convex schema, reactive queries (`useQuery`), mutations (`useMutation`), or multi-tenancy rules |
| **Development & Git**     | [`docs/development-workflow.md`](docs/development-workflow.md)         | Running dev/lint scripts, verification steps, conventional commit formatting, or boundaries     |

---

## Skills Reference

Specialized agent skills are auto-discovered from `.agents/skills/`. Consult the relevant skill before implementing complex workflows (e.g. `shadcn`, `eslint`, `migrate-radix-to-base`, `sync-docs`).
