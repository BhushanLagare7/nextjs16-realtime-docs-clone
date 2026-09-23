---
name: sync-docs
description: Analyzes the current Git diff to identify new coding patterns and updates the project's documentation conventions accordingly without bloating.
---

# Sync Docs

Use this skill when the user asks to "sync docs", perform a "Knowledge Synchronization", or when completing a feature, refactoring, or bug fix in the project.

## Workflow

1. **Analyze the Diff:**
   - Run `git status` and `git diff` (or compare against base branch e.g. `git diff main...HEAD`) to inspect code changes, architectural decisions, and review comments addressed in the session.
2. **Identify Learnings:**
   - Determine what reusable patterns, conventions, gotchas, or non-obvious rules were established or modified.
   - **Important:** If no new reusable conventions were established, explicitly report that no documentation updates were required and stop.
3. **Route & Update:**
   - Check the modular files in `docs/`:
     - `architecture.md` (System design, stack, client/server boundaries)
     - `code-conventions.md` (Formatting, imports, JSX prop sorting, TypeScript rules)
     - `nextjs-react-conventions.md` (App router, async params, React 19 patterns)
     - `editor-tiptap.md` (Tiptap extensions, ProseMirror schema, toolbar, ruler)
     - `realtime-collaboration.md` (Liveblocks room, presence cursors, comments)
     - `database-conventions.md` (Convex schema, queries, mutations, multi-tenancy)
     - `development-workflow.md` (Scripts, linting, git commit conventions)
   - Append or update the relevant file with concise, token-optimized bullet points or tables.
4. **Create (if necessary):**
   - If the learning belongs to a completely new domain or category, create a new `docs/[topic]-conventions.md` file adhering to the existing modular format.
5. **Sync the Index:**
   - If a new doc was created, update the `Documentation Router` table in [AGENTS.md](file:///Users/blagare/Desktop/Next%20JS%20Learning/nextjs16-realtime-docs-clone/AGENTS.md) with the document path and a concise 1-sentence summary of what it covers.
6. **Verify Formatting:**
   - Run `npm run format:check` (or `npx prettier --write <file>`) to ensure updated markdown files conform to project styling standards.

## Constraints

- Focus strictly on high-level reusable rules, patterns, and architectural conventions—never document one-off feature requirements or ephemeral bug details.
- Keep the language minimal, crisp, and token-efficient.
- Explicitly state which documentation files were updated or created and summarize the added rules.
