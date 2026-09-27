---
name: sync-docs
description: Analyzes the current Git diff to identify new coding patterns and updates the project's documentation conventions accordingly without bloating.
---

# Sync Docs

Use this skill when the user asks to "sync docs", perform a "Knowledge Synchronization", or when completing a feature, refactoring, or bug fix in the project.

## Workflow

1. **Analyze the Diff:**
   - Run `git status` and inspect all changes via `git diff HEAD` (or `git diff` + `git diff --staged`, or branch diff `git diff main...HEAD`) to capture staged, unstaged, and recent commit changes.
2. **Identify Learnings:**
   - Determine what reusable patterns, conventions, gotchas, or non-obvious rules were established or modified.
   - **Important:** If no new reusable conventions were established, explicitly report that no documentation updates were required and stop.
3. **Route & Update:**
   - Check the modular files in `docs/`:
     - `architecture-*.md` (System design, stack, directory layout, client/server boundaries)
     - `code-conventions-*.md` (TypeScript rules, ESLint, import sorting, JSX props, Tailwind styling, a11y)
     - `nextjs-react-conventions.md` (App router, async params, React 19 patterns)
     - `dashboard-*.md` (Home route layout, search input with nuqs, template gallery)
     - `editor-tiptap-*.md` (Core schema, extensions, canvas/ruler, toolbar, dropdown controls, navbar)
     - `realtime-collaboration-*.md` (Liveblocks room, presence cursors, comments, auth route)
     - `database-*.md` (Convex schema, queries, mutations, multi-tenancy)
     - `theming-*.md` (Architecture, OKLCH tokens, editor, prose, integrations, components, controls)
     - `development-workflow.md` (Scripts, linting, git commit conventions)
   - Append or update the relevant file with concise, token-optimized bullet points or tables.
4. **Create or Split (if necessary):**
   - If the learning belongs to a completely new domain, or if an existing document grows beyond 120 lines, break it down into logically named sub-files (`docs/[topic]-[subtopic].md`) adhering to the modular format.
5. **Sync the Indexes:**
   - Whenever a doc is created or split:
     - Update the `Documentation Router` table in `AGENTS.md` with the document path and a concise 1-sentence summary.
     - Update any related parent/overview documents (e.g. `docs/database-conventions.md`) that cross-reference the topic.
6. **Format & Verify:**
   - Proactively format updated markdown files via `npx prettier --write <touched-files>`.
   - Run the full verification suite before finishing: `npm run format:check && npm run lint && npm run typecheck`.

## Constraints

- Focus strictly on high-level reusable rules, patterns, and architectural conventions—never document one-off feature requirements or ephemeral bug details.
- Keep the language minimal, crisp, and token-efficient.
- Maintain the strict < 120 lines limit per documentation file.
- Explicitly state which documentation files were updated or created and summarize the added rules.
