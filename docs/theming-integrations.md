# Liveblocks & Clerk Authentication Theming

This document details third-party UI theming integration standards for **Liveblocks** and **Clerk**.

---

## 1. Real-Time Multiplayer Theming (`@liveblocks/react-ui`)

Liveblocks provides out-of-the-box UI components for comment threads, composer popovers, and inbox notifications.

### Dual-Stylesheet Requirement

Liveblocks uses class-based dark styling matching our `.dark` root attribute. Both default and attribute styles must be imported in the application entrypoint:

```typescript
// app/layout.tsx or components/room.tsx
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
```

With `@liveblocks/react-ui/styles/dark/attributes.css` loaded, all thread popovers, resolved comment badges, and active composer inputs automatically adapt to dark and system theme transitions without custom CSS overrides.

---

## 2. Authentication Theming (`@clerk/nextjs` & `@clerk/themes`)

Clerk auth dialogs, user profiles, and organization switchers must dynamically match the active theme.

### Pinned Dependencies

To support `appearance.baseTheme` with Next.js 16 and React 19 without version incompatibility, install pinned Clerk dependencies:

```bash
npm install @clerk/nextjs@^6.12.0 @clerk/themes@^2.2.20
```

### Dynamic `baseTheme` Binding

```tsx
"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { resolvedTheme } = useTheme()

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary:
            resolvedTheme === "dark"
              ? "oklch(0.922 0 0)" // Matches active dark primary token
              : "oklch(0.205 0 0)", // Matches active light primary token
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
```

---

## 3. Static SVG Artwork & Illustration Theming

Standalone SVG illustrations (e.g. template thumbnails in `public/*.svg`) loaded via `<img>` or CSS `background-image: url(...)` run in an isolated document context:

- **Isolation Constraint**: Host-page theme classes (e.g., `.dark` on `<html>`) and CSS variables do not affect SVGs loaded via `<img>` or `background-image`. Selectors like `:where(.dark, .dark *)` only work when `.dark` is present inside the SVG document itself.
- **Recommended Approach**: For app-controlled theming (e.g., toggled via `next-themes`), use **inline SVG** components or **theme-selected assets** (e.g., swapping asset URLs based on `resolvedTheme`).
- **Internal `<style>` Block**: For external SVGs adapting to OS preferences, use `@media (prefers-color-scheme: dark)`:
  ```xml
  <style>
    :root {
      --canvas-bg: var(--card, #ffffff);
      --canvas-border: var(--border, #e4e4e7);
      --text-foreground: var(--card-foreground, #18181b);
      --text-muted: var(--muted-foreground, #71717a);
      --primary: #1D4ED8;
    }
    .canvas-bg { fill: var(--canvas-bg); }
    .stroke-border { stroke: var(--canvas-border); }
    .text-foreground { fill: var(--text-foreground); }
    .text-muted { fill: var(--text-muted); }
    .primary { fill: var(--primary); }

    @media (prefers-color-scheme: dark) {
      :root {
        --canvas-bg: var(--card, #202024);
        --canvas-border: var(--border, rgba(255, 255, 255, 0.1));
        --text-foreground: var(--card-foreground, #fafafa);
        --text-muted: var(--muted-foreground, #a1a1aa);
        --primary: #93C5FD;
      }
    }
    :where(.dark, .dark *) {
      --canvas-bg: var(--card, #202024);
      --canvas-border: var(--border, rgba(255, 255, 255, 0.1));
      --text-foreground: var(--card-foreground, #fafafa);
      --text-muted: var(--muted-foreground, #a1a1aa);
      --primary: #93C5FD;
    }
  </style>
  ```
- **Contrast Adjustments**: In dark mode, soften primary brand accents (e.g., `#93C5FD` vs light mode `#1D4ED8`) to preserve legibility and prevent eye strain.
