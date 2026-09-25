# TypeScript Strictness Standards

This document establishes the TypeScript compiler rules, typing standards, and strictness requirements for the project.

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
