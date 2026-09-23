# Development Workflow, Verification & Git Standards

This document establishes the local development workflows, npm scripts, verification standards, git conventions, and boundary rules.

---

## 1. Project Scripts Reference

| Command                | Purpose                                                                             |
| :--------------------- | :---------------------------------------------------------------------------------- |
| `npm run dev`          | Launches Next.js local development server (`http://localhost:3000`).                |
| `npm run build`        | Compiles production bundle and checks static/dynamic routes.                        |
| `npm start`            | Runs the compiled production server.                                                |
| `npm run lint`         | Runs ESLint analysis across all project files.                                      |
| `npm run lint:fix`     | Runs ESLint and automatically corrects import orders and style rules.               |
| `npm run format`       | Runs ESLint fix and Prettier write across the repository.                           |
| `npm run format:check` | Verifies code formatting against Prettier and ESLint rules without modifying files. |
| `npm run typecheck`    | Validates TypeScript types across the entire project (`tsc --noEmit`).              |
| `npm test`             | Runs unit tests using `tsx --test`.                                                 |

---

## 2. Pre-Completion Verification Protocol

Before declaring any feature or bug fix complete, **always run the complete verification suite**:

```bash
npm run format:check && npm run lint && npm run typecheck
```

If formatting issues exist, execute `npm run format` and re-verify.

---

## 3. Git Commit Conventions

Commits must follow Conventional Commits formatting:

```
<type>: <short imperative description>
```

### Supported Types

- `feat`: A new feature or functional addition
- `fix`: A bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation updates (e.g. `docs/` or `AGENTS.md`)
- `style`: Changes that do not affect the meaning of code (formatting, linting)
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks, dependencies, or configuration tweaks

### Examples

- `feat: add font size dropdown to document toolbar`
- `fix: resolve asynchronous params type mismatch in document route`
- `refactor: extract ruler coordinate math to custom hook`
- `docs: modularize conventions into docs directory`

---

## 4. Protected Boundaries

### Files to Never Modify Without Explicit Consent

1. **Core Configuration**:
   - `next.config.ts`: Image domain allowlists and build configs.
   - `tsconfig.json`: Compiler options and path aliases.
   - `postcss.config.mjs`: Tailwind PostCSS pipeline.
   - `components.json`: shadcn component registry config.
   - `.gitignore`: Git untracked files specification.
2. **Environment Secrets**:
   - `.env.local`: Contains sensitive production or development keys. Never commit or overwrite.
3. **Build Artifacts**:
   - `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`.

---

## 5. Protocol for Handling Uncertainty

1. **Approach Ambiguity**: When multiple architectural paths exist, STOP and present the trade-offs before writing code.
2. **Breaking Changes**: Always warn and get confirmation before altering database schemas, authentication routes, or API contracts.
3. **Targeted Diffs**: Keep code modifications scoped strictly to the task at hand. Avoid unrelated refactoring.

---

## 6. Implementing Features from Reference Diffs

When user requests include historical commit diffs for new features:

1. **Reference, Not Copy-Paste**: Diffs demonstrate functional intent and scope from an earlier version. Never replicate outdated patterns, older package versions, or legacy component structures blindly.
2. **Consult Skills & Docs First**: Before writing any code, discover and review relevant skills in `.agents/skills/` (e.g., `tiptap`, `shadcn`, `eslint`) and read the relevant guide in `docs/` (`docs/editor-tiptap.md`, `docs/nextjs-react-conventions.md`, `docs/realtime-collaboration.md`).
3. **Canonical Component & Symbol Naming**: Always use the canonical names defined in `docs/` (e.g., `DocumentEditor` instead of generic `Editor` which shadows Tiptap's core class).
4. **Modern Framework Adaptation**: Ensure code conforms to React 19 standards (Server vs. Client components, explicit props interfaces, function declarations) and Next.js 16 standards (awaiting dynamic route `params`).
