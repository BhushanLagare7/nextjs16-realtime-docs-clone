# ESLint, Import Sorting & JSX Prop Conventions

This document establishes the ESLint rules, deterministic import sorting groups, and JSX prop ordering standards.

---

## 1. ESLint & Import Sorting

Import sorting is strictly enforced via `eslint-plugin-simple-import-sort` in `eslint.config.mjs`.

### The 7 Import Groups (in Order)

1. **Side-effects** (e.g., CSS files, polyfills):
   ```typescript
   import "./globals.css"
   import "@liveblocks/react-ui/styles.css"
   ```
2. **React & Next.js core libraries**:
   ```typescript
   import { useEffect, useState } from "react"
   import Link from "next/link"
   import { useRouter } from "next/navigation"
   ```
3. **Third-party npm packages** (excluding project aliases):
   ```typescript
   import { Editor } from "@tiptap/react"
   import { LucideIcon, Bold } from "lucide-react"
   ```
4. **Internal project aliases (`@/*`)**:
   ```typescript
   import { Button } from "@/components/ui/button"
   import { useEditorStore } from "@/store/use-editor-store"
   import { cn } from "@/lib/utils"
   ```
5. **Parent directory relative imports** (`../`):
   ```typescript
   import { ParentComponent } from "../parent"
   ```
6. **Sibling directory relative imports** (`./`):
   ```typescript
   import { SiblingComponent } from "./sibling"
   ```
7. **Catch-all**: Any remaining imports.

> [!TIP]
> Do not sort imports manually. Run `npm run lint:fix` to sort them automatically.

---

## 2. JSX Prop Ordering

Enforced by ESLint rule `react/jsx-sort-props`:

1. **Reserved props first**: `key`, `ref`.
2. **Alphabetical standard & shorthand props**: `className`, `disabled`, `id`, `size`, `variant` (shorthand and boolean attributes are alphabetized together with other non-callback props).
3. **Callbacks last**: `onBlur`, `onChange`, `onClick`, `onKeyDown`.

```tsx
// ✅ Correct JSX Prop Order
<Button
  key={tool.id}
  ref={buttonRef}
  className="h-7 min-w-7 p-1"
  disabled={!editor}
  size="sm"
  variant={isActive ? "secondary" : "ghost"}
  onClick={() => executeCommand()}
>
  <tool.icon className="size-4" />
</Button>
```
