# TypeScript Strictness & Code Conventions

This document establishes the TypeScript compiler rules, typing standards, anti-magic values policies, and icon import conventions for the project.

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

## 2. Icon Import Conventions

All icons imported from `lucide-react` must be aliased or imported with an `Icon` suffix to avoid namespace clashes with standard HTML elements, UI components, or domain models (e.g., `Loader` vs `LoaderIcon`, `Table` vs `TableIcon`).

- **Correct**:

  ```typescript
  import { LoaderIcon } from "lucide-react"

  <LoaderIcon className="size-4 animate-spin" />
  ```

  _(Or aliased when the icon is imported under a non-suffixed name)_:

  ```typescript
  import { Loader as LoaderIcon } from "lucide-react"

  <LoaderIcon className="size-4 animate-spin" />
  ```

- **Incorrect**:
  ```typescript
  import { Loader } from "lucide-react"

  <Loader className="size-4 animate-spin" />
  ```

---

## 3. Anti-Magic Values Standards

Avoid unexplained literals directly embedded in implementation logic to ensure readability, maintainability, and domain clarity.

### Rules

1. **No Magic Numbers**:
   - Replace unexplained numeric literals with appropriately named `const` variables, enums, or config parameters (e.g., timeouts, retry counts, HTTP status codes, layout thresholds).
   - Example:
     ```typescript
     // ❌ BAD
     setTimeout(cleanup, 300000)

     // ✅ GOOD
     const SESSION_CLEANUP_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
     setTimeout(cleanup, SESSION_CLEANUP_TIMEOUT_MS)
     ```

2. **No Magic Strings**:
   - Extract hardcoded string literals (e.g., status keys, localStorage keys, URL paths, role names) into shared constants or enums.
   - Example:
     ```typescript
     // ❌ BAD
     if (user.role === "admin") { ... }
     localStorage.getItem("theme_mode")

     // ✅ GOOD
     export const USER_ROLES = {
       ADMIN: "admin",
       MEMBER: "member",
     } as const

     export const STORAGE_KEYS = {
       THEME_MODE: "theme_mode",
     } as const
     ```

3. **Exceptions**:
   - **Standard mathematical initializers**: Literals such as `0`, `1`, or `-1` in loops, counters, indexing, or basic comparisons are allowed without extraction.
   - **Obvious contextual literals**: If a literal's meaning is universally obvious from its immediate context, extraction is optional.
