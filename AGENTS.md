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
6. **Reference Diffs as Intent, Not Ground Truth**: Historical diffs provided by the user represent past implementations with older packages and conventions — NEVER follow them blindly. Always:
   - Check available skills in `.agents/skills/` and domain documentation in `docs/` before implementing.
   - Adhere strictly to canonical naming conventions and architecture contracts documented in `docs/` (e.g., `DocumentEditor` with `documentId` prop, never generic names like `Editor`).
   - Implement using the latest package versions and modern industry-standard coding practices adapted for Next.js 16 and React 19.
7. **Strict Design Tokens & Zero Hardcoded Colors Policy**: Never use hardcoded hex values (e.g., `#FAFBFD`, `#C7C7C7`, `#ffffff`), RGB/HSL, or raw Tailwind color utility classes (e.g., `bg-white`, `text-black`, `text-blue-500`, `dark:bg-zinc-900`) for component, canvas, or layout styling. All surfaces, text, borders, and controls MUST strictly use established semantic design tokens or theme CSS variables (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-secondary`, etc.). Custom surface colors must be registered as semantic theme tokens in `app/globals.css` with both `:root` (light) and `.dark` (dark) OKLCH definitions. Exceptions apply strictly to collaborator cursor labels (`#ffffff` for contrast against saturated user hues) and print media isolation (`print:bg-white` and `print:text-black`).

---

## Documentation Router

Detailed architecture guides and conventions have been modularized in the `docs/` directory to save context tokens. **Read the relevant document before writing code in that domain:**

| Topic                                | Document                                                                             | When to Consult                                                                                 |
| :----------------------------------- | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Architecture Overview**            | [`docs/architecture-overview.md`](docs/architecture-overview.md)                     | High-level system design, architecture overview, and technology stack                           |
| **Architecture Structure**           | [`docs/architecture-structure.md`](docs/architecture-structure.md)                   | Directory layout, file structure, Server vs Client boundaries, and state separation             |
| **Code Style (TypeScript)**          | [`docs/code-conventions-typescript.md`](docs/code-conventions-typescript.md)         | TypeScript strictness, zero `any` policy, explicit signatures, and `useRef` typing              |
| **Code Style (Formatting)**          | [`docs/code-conventions-formatting.md`](docs/code-conventions-formatting.md)         | ESLint 7-group import sorting and JSX prop ordering rules                                       |
| **Code Style (Styling & a11y)**      | [`docs/code-conventions-styling.md`](docs/code-conventions-styling.md)               | Tailwind CSS v4, `cn()` merging, zero hardcoded colors policy, and accessibility                |
| **Next.js 16 & React 19**            | [`docs/nextjs-react-conventions.md`](docs/nextjs-react-conventions.md)               | App Router pages/layouts, async params, Server vs Client components, or React 19 hooks/actions  |
| **Editor (Core & Schema)**           | [`docs/editor-tiptap-core.md`](docs/editor-tiptap-core.md)                           | Tiptap engine setup, editor store, and block vs inline text attribute matrix                    |
| **Editor (Inline Extensions)**       | [`docs/editor-tiptap-extensions-inline.md`](docs/editor-tiptap-extensions-inline.md) | Custom inline mark/style extensions (`extensions/font-size.ts`) and command chaining            |
| **Editor (Block Extensions)**        | [`docs/editor-tiptap-extensions-block.md`](docs/editor-tiptap-extensions-block.md)   | Custom block-level extensions (`extensions/line-height.ts`) using `setNodeMarkup`               |
| **Editor (Canvas & Ruler)**          | [`docs/editor-tiptap-canvas.md`](docs/editor-tiptap-canvas.md)                       | Document canvas layout (816px), ruler pointer tracking, printable margins, and list styles      |
| **Editor (Toolbar Pattern)**         | [`docs/editor-tiptap-toolbar.md`](docs/editor-tiptap-toolbar.md)                     | Toolbar component architecture, button groups, and active state styling                         |
| **Editor (Toolbar Controls)**        | [`docs/editor-tiptap-controls.md`](docs/editor-tiptap-controls.md)                   | Dropdown selectors, color/highlight popovers, link/image dialogs, and steppers                  |
| **Editor (Navbar & Menubar)**        | [`docs/editor-tiptap-navbar.md`](docs/editor-tiptap-navbar.md)                       | Document title input, export operations (JSON/HTML/PDF), table grid, and menubar                |
| **Multiplayer (Room & Presence)**    | [`docs/realtime-collaboration-room.md`](docs/realtime-collaboration-room.md)         | Liveblocks room setup, presence cursors, avatars, and comment threads                           |
| **Multiplayer (Auth & Permissions)** | [`docs/realtime-collaboration-auth.md`](docs/realtime-collaboration-auth.md)         | `/api/liveblocks-auth` route handler, Clerk permissions, and protected boundaries               |
| **Database & Backend**               | [`docs/database-conventions.md`](docs/database-conventions.md)                       | Convex schema, reactive queries (`useQuery`), mutations (`useMutation`), or multi-tenancy rules |
| **Theming (Architecture)**           | [`docs/theming-architecture.md`](docs/theming-architecture.md)                       | Tri-theme model (light/dark/system), next-themes setup, and core invariant rules                |
| **Theming (Tokens)**                 | [`docs/theming-tokens.md`](docs/theming-tokens.md)                                   | OKLCH semantic tokens, Tailwind v4 `@theme inline`, pairing matrix, and status colors           |
| **Theming (Editor & Cursors)**       | [`docs/theming-editor.md`](docs/theming-editor.md)                                   | Dual-surface canvas theming, print media isolation, and multiplayer cursor flags                |
| **Theming (Prose Styling)**          | [`docs/theming-prose.md`](docs/theming-prose.md)                                     | Typography and ProseMirror content element styling in dark/light mode                           |
| **Theming (Integrations)**           | [`docs/theming-integrations.md`](docs/theming-integrations.md)                       | Liveblocks UI dual-stylesheet setup and Clerk appearance `baseTheme` binding                    |
| **Theming (Chrome & Components)**    | [`docs/theming-components.md`](docs/theming-components.md)                           | Ruler, toolbar, popover, and color picker theming plus new component checklist                  |
| **Theming (Controls & UX)**          | [`docs/theming-controls.md`](docs/theming-controls.md)                               | Global `d` hotkey listener, `ModeToggle` component pattern, and transition glitch prevention    |
| **Development & Git**                | [`docs/development-workflow.md`](docs/development-workflow.md)                       | Running dev/lint scripts, verification steps, conventional commit formatting, or boundaries     |

---

## Skills Reference

Specialized agent skills are auto-discovered from `.agents/skills/`. Consult the relevant skill before implementing complex workflows (e.g. `shadcn`, `eslint`, `migrate-radix-to-base`, `sync-docs`).
