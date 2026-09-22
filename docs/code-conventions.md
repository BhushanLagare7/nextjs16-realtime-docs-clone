# Code Style, TypeScript & Formatting Conventions

This document establishes the code quality standards, TypeScript rules, ESLint configuration, import sorting, and styling conventions for this project.

---

## 1. TypeScript Strictness Standards

The project operates under strict TypeScript compiler rules. All code must compile cleanly with `npm run typecheck` (`tsc --noEmit`).

### Invariant Rules

1. **Zero `any` Policy**:
   - Never use `any`. Use specific interfaces, types, generics, or `unknown` with runtime type narrowing.
   - Example:
     ```typescript
     // ❌ BAD
     function processEvent(data: any) { ... }

     // ✅ GOOD
     function processEvent<T extends EditorEvent>(data: T) { ... }
     // OR
     function processEvent(data: unknown) {
       if (isValidEvent(data)) { ... }
     }
     ```
2. **No `@ts-ignore` or `@ts-nocheck`**:
   - Bypassing the compiler hides critical bugs. Fix the underlying type signature instead.
   - If interfacing with an external library lacking typings, create a dedicated declaration file in `types/`.
3. **Explicit Function Signatures**:
   - Document utility functions, hook returns, and complex handlers with explicit return types and parameter types.
4. **Proper `useRef` Typing**:
   - Always initialize `useRef` with an explicit type argument and appropriate default value (typically `null`):
     ```typescript
     // ❌ BAD
     const timerRef = useRef<NodeJS.Timeout>()

     // ✅ GOOD
     const timerRef = useRef<NodeJS.Timeout | null>(null)
     ```

---

## 2. ESLint & Import Sorting

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

## 3. JSX Prop Ordering

Enforced by ESLint rule `react/jsx-sort-props`:

1. **Reserved props first**: `key`, `ref`.
2. **Shorthand / Boolean attributes**: `disabled`, `autoFocus`.
3. **Alphabetical standard props**: `className`, `id`, `size`, `variant`.
4. **Callbacks last**: `onBlur`, `onChange`, `onClick`, `onKeyDown`.

```tsx
// ✅ Correct JSX Prop Order
<Button
  ref={buttonRef}
  key={tool.id}
  disabled={!editor}
  className="h-7 min-w-7 p-1"
  size="sm"
  variant={isActive ? "secondary" : "ghost"}
  onClick={() => executeCommand()}
>
  <tool.icon className="size-4" />
</Button>
```

---

## 4. Tailwind CSS v4 & ClassName Merging

1. **Always use the `cn()` utility**:
   - Combine class names conditionally using `cn()` from `@/lib/utils` (powered by `clsx` and `tailwind-merge`).
   - ```tsx
     import { cn } from "@/lib/utils"

     export function StatusBadge({ active, className }: StatusBadgeProps) {
       return (
         <span
           className={cn(
             "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
             active
               ? "bg-emerald-500/10 text-emerald-600"
               : "bg-muted text-muted-foreground",
             className
           )}
         >
           {active ? "Live" : "Draft"}
         </span>
       )
     }
     ```
2. **Component Variants with CVA**:
   - For components with multiple variants or sizes, use `class-variance-authority` (`cva`).
3. **No Arbitrary Inline Styles**:
   - Never use `style={{ color: "red" }}`. Use Tailwind utility classes.
   - Inline styles are permitted **only** for dynamically calculated coordinates or measurements (e.g. ruler positioning, drag-and-drop handles, custom margins in pixels).

---

## 5. Accessibility (a11y) Standards

- **Icon Buttons**: All interactive elements lacking visible text (such as toolbar buttons) MUST include an descriptive `aria-label`:
  ```tsx
  <Button aria-label="Toggle Bold" size="icon" variant="ghost">
    <Bold className="size-4" />
  </Button>
  ```
- **Keyboard Navigation**: Ensure custom dropdowns, popovers, and dialogs remain accessible via Tab, Escape, and Enter keys.
- **Color Contrast**: Respect dark and light theme tokens configured in `app/globals.css`.
