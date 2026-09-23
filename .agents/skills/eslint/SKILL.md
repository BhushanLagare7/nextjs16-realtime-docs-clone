---
name: eslint
description: Enforce, fix, configure, and debug ESLint and Prettier rules, flat config (eslint.config.mjs), deterministic import sorting (eslint-plugin-simple-import-sort), and JSX prop sorting (react/jsx-sort-props) in Next.js.
---

# ESLint & Code Standards Skill

This skill guides the inspection, maintenance, execution, and debugging of ESLint and formatting standards within this project.

## Project Configuration Overview

The project uses ESLint Flat Config (`eslint.config.mjs`) compatible with Next.js 16 and React 19:

- **Config File:** `eslint.config.mjs`
- **Presets:** `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- **Plugins:** `eslint-plugin-simple-import-sort`, `eslint-plugin-react`
- **Prettier:** `prettier` with `prettier-plugin-tailwindcss`

---

## Core Scripts & Commands

Always use the npm scripts configured in `package.json`:

| Command | Purpose |
|---|---|
| `npm run lint` | Runs `eslint` across all project files |
| `npm run lint:fix` | Runs `eslint --fix` to automatically sort imports, props, and fix errors |
| `npm run format` | Runs `eslint --fix && prettier --write .` for full formatting |
| `npm run format:check` | Runs `prettier --check . && eslint` for CI checks |
| `npm run typecheck` | Runs `tsc --noEmit` to verify type safety |

---

## Enforced Rules & Conventions

### 1. Deterministic Import Sorting (`simple-import-sort`)

Imports must strictly follow this grouping order, separated by blank lines when autofixed:

1. **Side-effects:** `^\u0000` (e.g. `./globals.css`)
2. **React & Next.js Core:** `^react`, `^next` (e.g. `react`, `next/link`, `next/navigation`)
3. **Third-party packages:** `^@?\w` (e.g. `lucide-react`, `class-variance-authority`)
4. **Internal aliases:** `^@/` (e.g. `@/components/ui/button`, `@/lib/utils`)
5. **Parent relative imports:** `^\.\.` (e.g. `../utils`)
6. **Sibling relative imports:** `^\.` (e.g. `./button-group`)
7. **Catch-all**

```tsx
// Incorrect
import { Button } from "@/components/ui/button"
import * as React from "react"
import "./globals.css"

// Correct
import "./globals.css"

import * as React from "react"

import { Button } from "@/components/ui/button"
```

### 2. JSX Prop Sorting (`react/jsx-sort-props`)

Props in JSX/TSX elements are sorted with the following constraints:
- **`reservedFirst: true`:** Reserved React props (`key`, `ref`) MUST come first.
- **`callbacksLast: true`:** Event handlers (`onClick`, `onKeyDown`, `onChange`, etc.) MUST come last.
- **`noSortAlphabetically: false`:** Attributes between reserved and callbacks are sorted alphabetically (case-insensitive).

```tsx
// Incorrect
<Button onClick={handleClick} variant="outline" key={item.id} size="sm">
  Click
</Button>

// Correct
<Button key={item.id} size="sm" variant="outline" onClick={handleClick}>
  Click
</Button>
```

### 3. Global Ignores

The following paths are ignored by ESLint in `eslint.config.mjs`:
- Build outputs: `.next/**`, `out/**`, `build/**`
- Generated contracts & types: `next-env.d.ts`, `generated/**`, `src/prisma/contract.d.ts`, `src/prisma/contract.json`, `migrations/**`
- Agent & skill definitions: `agent/**`, `.agents/**`

---

## Troubleshooting & Best Practices

1. **Auto-fix first:** Before manually rewriting imports or props, run `npm run lint:fix`. It will automatically reorder imports and JSX props according to the rules.
2. **Prettier Conflicts:** Formatting rules (indentation, quotes, semicolons, trailing commas) are managed by Prettier (`.prettierrc`). Do not add formatting rules to `eslint.config.mjs` that duplicate or conflict with Prettier.
3. **TypeScript Alignment:** If ESLint complains about TypeScript types, run `npm run typecheck` to diagnose underlying type issues.
4. **ESLint 9 Compatibility:** `eslint-config-next` relies on `eslint-plugin-react`, which requires ESLint 9 (`^9.39.5`). Do not upgrade to ESLint 10 until Next.js and its plugin ecosystem publish full ESLint 10 compatibility.
