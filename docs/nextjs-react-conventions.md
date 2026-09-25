# Next.js 16 & React 19 Conventions

This document outlines the core conventions for Next.js 16 App Router and React 19 implementations across the codebase.

---

## 1. Next.js 16 Dynamic Route Params (`params` are Promises)

In Next.js 16, dynamic route `params` and `searchParams` passed to pages, layouts, and route handlers are **Promises**. They must always be awaited before accessing properties.

### ✅ Correct Usage

```tsx
// app/documents/[documentId]/page.tsx
interface DocumentPageProps {
  params: Promise<{ documentId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DocumentPage({
  params,
  searchParams,
}: DocumentPageProps) {
  const { documentId } = await params
  const resolvedSearchParams = await searchParams

  return (
    <main>
      <DocumentEditor documentId={documentId} />
    </main>
  )
}
```

### ❌ Incorrect Usage

```tsx
// ❌ FAILS IN NEXT.JS 16
export default function DocumentPage({ params }: { params: { documentId: string } }) {
  const { documentId } = params; // Error: params should be awaited
  ...
}
```

---

## 2. React 19 Component Standards

1. **Functional Components Only**:
   - Class-based React components are prohibited. Use modern functional components with hooks.
2. **Server Components by Default**:
   - All components in the `app/` directory are Server Components unless explicitly annotated with `"use client"`.
   - Keep database queries, static metadata generation, and initial layout wrappers on the server.
3. **Client Component Boundaries**:
   - Add `"use client"` only at the leaf nodes requiring browser APIs, React state/effects, DOM event handlers, or Liveblocks/Tiptap hooks.
   - Example:
     ```tsx
     "use client";

     import { useState } from "react";
     import { Button } from "@/components/ui/button";

     export function RenameDialog({ documentId }: { documentId: string }) {
       const [open, setOpen] = useState(false);
       ...
     }
     ```
4. **Function Declaration Syntax**:
   - Always declare and export components and functions using function declarations directly (`export default function ComponentName() { ... }` or `export function ComponentName() { ... }`), rather than arrow functions assigned to `const` variables.

---

## 3. Hook Conventions & React Compiler Readiness

1. **No Async Functions Inside `useMemo`**:
   - `useMemo` must be strictly synchronous and pure. For asynchronous tasks, use `useEffect` or Server Components.
2. **Proper `useRef` Initialization**:
   - Provide an explicit initial value (usually `null`) to prevent `undefined` mismatches:
     ```typescript
     const editorRef = useRef<HTMLDivElement | null>(null)
     ```
3. **Avoid Unnecessary Re-Renders**:
   - Keep hooks focused. Extract derived state using pure calculations or selector hooks rather than multiple chained effects.
4. **URL Search Parameter State (`nuqs`)**:
   - For interactive state that should sync with the URL (such as search queries, filters, pagination), use `nuqs` typed parsers and hooks (`parseAsString.withDefault("").withOptions({ clearOnDefault: true })`).
   - Wrap client components that consume `nuqs` hooks in a React `<Suspense>` boundary to prevent Next.js static prerender CSR bailouts.
   - Wrap children with `<NuqsAdapter>` in the root `app/layout.tsx`.

5. **Global Keyboard Shortcut Listeners**:
   - Always guard listeners against editable targets (`target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))`) to prevent hotkeys (e.g. theme toggle shortcuts) from firing while a user is typing inside text inputs, textareas, or Tiptap editor nodes.

---

## 4. Special Next.js App Router Files

- **`layout.tsx`**: Defines the shared UI frame. Wraps children with providers (`ThemeProvider`, `NuqsAdapter`, `ConvexClientProvider`). Include `suppressHydrationWarning` on `<html lang="en">` to prevent attribute mismatch warnings when `next-themes` injects theme classes.
- **`loading.tsx`**: Renders instant loading skeletons using React Suspense while server data resolves.
- **`error.tsx`**: Error boundary catch-all for a route segment. **Must always include `"use client"`**.
- **`not-found.tsx`**: Displayed when `notFound()` is invoked.
