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
