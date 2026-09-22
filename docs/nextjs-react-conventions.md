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
   - For interactive state that should sync with the URL (such as search filters, active tabs, template categories), use the `nuqs` library adapter:
     ```tsx
     "use client";

     import { useQueryState } from "nuqs";

     export function SearchInput() {
       const [search, setSearch] = useQueryState("search", { defaultValue: "" });
       ...
     }
     ```

---

## 4. Special Next.js App Router Files

- **`layout.tsx`**: Defines the shared UI frame. Wraps children with providers (`ThemeProvider`, `NuqsAdapter`, `ConvexClientProvider`).
- **`loading.tsx`**: Renders instant loading skeletons using React Suspense while server data resolves.
- **`error.tsx`**: Error boundary catch-all for a route segment. **Must always include `"use client"`**.
- **`not-found.tsx`**: Displayed when `notFound()` is invoked.
