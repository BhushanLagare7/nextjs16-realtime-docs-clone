# Theming & Color System Conventions

This document establishes the architecture, semantic color token standards, and dark/system mode implementation rules across all layers of the stack: **Next.js 16**, **Tailwind CSS v4**, **shadcn/ui**, **Tiptap rich-text editor**, **Liveblocks multiplayer UI**, and **Clerk authentication**.

---

## 1. High-Level Theming Architecture

The application implements a **tri-theme model** supporting:

1. **Light Theme**: Clean, high-contrast light surfaces.
2. **Dark Theme**: Low-glare dark surfaces built on deep neutral OKLCH tones.
3. **System Theme (Default)**: Dynamically matches the user's operating system preferences (`prefers-color-scheme`) and responds to OS-level changes in real time.

```
┌────────────────────────────────────────────────────────┐
│               Operating System / Browser               │
│             (prefers-color-scheme: dark)               │
└───────────────────────────┬────────────────────────────┘
                            │ System preference event
┌───────────────────────────▼────────────────────────────┐
│          next-themes Provider (theme-provider.tsx)     │
│   - attribute="class"                                  │
│   - defaultTheme="system"                              │
│   - enableSystem={true}                                │
│   - disableTransitionOnChange={true}                   │
│   - ThemeHotkey (global "d" shortcut)                  │
└───────────────────────────┬────────────────────────────┘
                            │ Toggles .dark class on <html>
┌───────────────────────────▼────────────────────────────┐
│              HTML Document Root (layout.tsx)           │
│   - <html class="dark" suppressHydrationWarning>       │
├───────────────────────────┬────────────────────────────┤
│   Tailwind CSS v4 Engine  │   Liveblocks & Clerk CSS   │
│  @custom-variant dark     │  - Liveblocks dark styles  │
│  @theme inline tokens     │  - Clerk dark appearance   │
│  OKLCH :root / .dark      │                            │
├───────────────────────────┴────────────────────────────┤
│                 Application Components                 │
│  - shadcn/ui Primitives (bg-background, text-card)     │
│  - Tiptap Canvas (bg-card / print:bg-white)            │
│  - Document Chrome (Ruler, Toolbars, Menus)            │
└────────────────────────────────────────────────────────┘
```

### Invariant Rules

1. **Hydration Warning Suppression**:
   - The root `<html>` element in [`app/layout.tsx`](file:///Users/blagare/Desktop/Next%20JS%20Learning/nextjs16-realtime-docs-clone/app/layout.tsx) MUST include `suppressHydrationWarning` to prevent React hydration mismatch warnings when `next-themes` updates the `class` attribute before mounting.
2. **Zero Manual `dark:` Color Overrides**:
   - NEVER use manual class combinations such as `bg-white dark:bg-zinc-900` or `text-black dark:text-white` on components.
   - ALWAYS use semantic tokens (e.g. `bg-background text-foreground`, `bg-card text-card-foreground`). Semantic tokens resolve automatically to their respective `:root` or `.dark` CSS variables.
3. **Print Media Isolation**:
   - The document canvas MUST print strictly in paper white with black ink regardless of whether the user is actively viewing in dark or light mode (`print:bg-white print:text-black print:border-none print:shadow-none`).

---

## 2. Tailwind CSS v4 & OKLCH Semantic Tokens

All colors are defined in [`app/globals.css`](file:///Users/blagare/Desktop/Next%20JS%20Learning/nextjs16-realtime-docs-clone/app/globals.css) using the **OKLCH** color model (`oklch(L C H)`), which offers uniform perceived lightness and superior color rendering across displays.

### Tailwind v4 Configuration

In Tailwind CSS v4, dark mode is registered using the `@custom-variant` directive, and CSS variables are exposed through `@theme inline`:

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* Enables class-based dark variant */
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}
```

### Semantic Token Pairing Matrix

Every surface color follows the canonical `name` and `name-foreground` pairing to guarantee accessible WCAG AA/AAA contrast ratios:

| Token Variable           | Tailwind Utility Class      | Intended Usage                              | Light Mode OKLCH            | Dark Mode OKLCH                    |
| :----------------------- | :-------------------------- | :------------------------------------------ | :-------------------------- | :--------------------------------- |
| `--background`           | `bg-background`             | Default page background                     | `oklch(1 0 0)` (pure white) | `oklch(0.145 0 0)` (deep charcoal) |
| `--foreground`           | `text-foreground`           | High-emphasis body text                     | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`                 |
| `--card`                 | `bg-card`                   | Document canvas sheet, cards, dialogs       | `oklch(1 0 0)`              | `oklch(0.205 0 0)`                 |
| `--card-foreground`      | `text-card-foreground`      | Text on card/document canvas                | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`                 |
| `--popover`              | `bg-popover`                | Floating toolbars, dropdown menus           | `oklch(1 0 0)`              | `oklch(0.205 0 0)`                 |
| `--popover-foreground`   | `text-popover-foreground`   | Text inside popovers and menus              | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`                 |
| `--primary`              | `bg-primary`                | Primary buttons, active markers             | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`                 |
| `--primary-foreground`   | `text-primary-foreground`   | Text/icons on primary surfaces              | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`                 |
| `--secondary`            | `bg-secondary`              | Active toolbar items, chips                 | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`                 |
| `--secondary-foreground` | `text-secondary-foreground` | Text on secondary surfaces                  | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`                 |
| `--muted`                | `bg-muted`                  | Document workspace backdrop, disabled items | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`                 |
| `--muted-foreground`     | `text-muted-foreground`     | Subtitles, ruler ticks, empty placeholders  | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`                 |
| `--accent`               | `bg-accent`                 | Hover states on menus and buttons           | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`                 |
| `--accent-foreground`    | `text-accent-foreground`    | Text on hovered items                       | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`                 |
| `--destructive`          | `bg-destructive`            | Danger actions, delete modals               | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)`        |
| `--border`               | `border-border`             | Document page boundary, dividers            | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`               |
| `--input`                | `border-input`              | Form inputs, select dropdowns               | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 15%)`               |
| `--ring`                 | `ring-ring`                 | Keyboard focus indicator                    | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`                 |

### Status & Indicator Colors

> [!CAUTION]
> Never use raw status colors such as `text-emerald-500` or `bg-red-500`. Always use semantic variants:
>
> ```tsx
> // ❌ BAD: Hardcoded raw colors break contrast in dark mode
> <span className="text-emerald-600 bg-emerald-50">Saved</span>
> <span className="text-red-500">Error saving</span>
>
> // ✅ GOOD: Semantic tokens adapt automatically
> <Badge variant="secondary">Saved</Badge>
> <span className="text-destructive">Error saving</span>
> ```

---

## 3. Tiptap Headless Editor Theming

Tiptap is inherently **headless** — it ships without default styles or color opinions. All editor styling is driven by our CSS architecture.

### The Dual-Surface Document Layout

A document editor UI contains two distinct physical surfaces:

1. **The Workspace Viewport**: The scrollable area surrounding the document page.
2. **The Document Canvas ("Paper")**: The printable page sheet representing the 8.5in × 11in page (`816px` width at 96 DPI).

```tsx
// app/documents/[documentId]/editor.tsx
export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style: "padding-left: 56px; padding-right: 56px;",
        class: cn(
          "flex min-h-[1054px] w-[816px] cursor-text flex-col pt-10 pr-14 pb-10 focus:outline-none",
          // Theming: Uses semantic card surface on screen, strictly white on print
          "border border-border bg-card text-card-foreground shadow-xs",
          "print:border-none print:bg-white print:p-0 print:text-black print:shadow-none"
        ),
      },
    },
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
  })

  return (
    // Workspace Viewport: bg-muted/40 adapts cleanly between light & dark
    <div className="size-full overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto flex w-[816px] min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
```

### Editor Prose Elements & Dark Mode

All internal document elements rendered by ProseMirror must utilize semantic CSS classes:

```css
/* Tiptap content styling in app/globals.css or scoped editor classes */
.tiptap {
  /* Selection Highlight */
  & ::selection {
    background-color: var(--primary);
    color: var(--primary-foreground);
    opacity: 0.2;
  }

  /* Headings & Text */
  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    color: var(--card-foreground);
    font-weight: 700;
  }

  & p {
    color: var(--card-foreground);
  }

  /* Blockquotes */
  & blockquote {
    border-left: 3px solid var(--primary);
    color: var(--muted-foreground);
    padding-left: 1rem;
    font-style: italic;
  }

  /* Code Blocks */
  & pre {
    background-color: var(--muted);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
  }

  & code {
    background-color: var(--muted);
    color: var(--foreground);
    border-radius: calc(var(--radius) * 0.5);
    padding: 0.2rem 0.4rem;
  }

  /* Tables */
  & table {
    border-collapse: collapse;
    width: 100%;

    & td,
    & th {
      border: 1px solid var(--border);
      padding: 0.5rem;
    }

    & th {
      background-color: var(--muted);
      font-weight: 600;
    }
  }

  /* Empty Paragraph Placeholder */
  & p.is-editor-empty:first-child::before {
    color: var(--muted-foreground);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    opacity: 0.6;
  }
}
```

### Multiplayer Presence Cursors & Carets

In real-time multiplayer sessions (via Liveblocks / Y.js):

- **Collaborator Caret Flags**: Each collaborator is assigned a unique hue. Caret flags MUST display the collaborator's name pill with high-contrast text:
  ```css
  .collaboration-cursor__caret {
    border-left: 2px solid var(--cursor-color);
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
    position: relative;
    word-break: normal;
  }

  .collaboration-cursor__label {
    background-color: var(--cursor-color);
    border-radius: 3px;
    color: #ffffff; /* Explicit contrast against saturated cursor colors */
    font-size: 11px;
    font-weight: 600;
    left: -2px;
    line-height: normal;
    padding: 1px 4px;
    position: absolute;
    top: -1.4em;
    user-select: none;
    white-space: nowrap;
  }
  ```

---

## 4. Real-Time Multiplayer Theming (`@liveblocks/react-ui`)

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

## 5. Authentication Theming (`@clerk/nextjs` & `@clerk/themes`)

Clerk auth dialogs, user profiles, and organization switchers must dynamically match the active theme.

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
          colorPrimary: "oklch(0.205 0 0)", // Matches app primary token
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
```

---

## 6. Document Chrome: Ruler, Toolbars & Menus

### Interactive Ruler (`ruler.tsx`)

The horizontal ruler must seamlessly integrate into both light and dark document canvases:

- **Ruler Track**: `bg-background` with bottom border `border-border`.
- **Ruler Ticks & Scale Numbers**: `text-[10px] text-muted-foreground/70`.
- **Margin Drag Markers (Left & Right)**: Marker SVGs use `fill-primary hover:fill-primary/80` for high visibility on the scale.

### Document Toolbar (`components/toolbar/`)

- **Toolbar Container**: Sticky top frame with `bg-background/95 backdrop-blur border-b border-border`.
- **Toolbar Buttons**:
  - Inactive: `variant="ghost"` (`text-foreground hover:bg-accent hover:text-accent-foreground`).
  - Active: `variant="secondary"` (`bg-secondary text-secondary-foreground`).
  - Disabled: `disabled:opacity-40 disabled:pointer-events-none`.

---

## 7. Theme Switching Controls & UX

### 1. Global Keyboard Shortcut

Configured in [`components/theme-provider.tsx`](file:///Users/blagare/Desktop/Next%20JS%20Learning/nextjs16-realtime-docs-clone/components/theme-provider.tsx):

- Pressing **`d`** toggles between `light` and `dark`.
- The hotkey listener inspects `event.target` to safely ignore keystrokes inside `input`, `textarea`, `select`, or any `contentEditable` element (preventing accidental toggling while drafting documents in Tiptap).

### 2. Mode Toggle Component Pattern

For explicit user selection between **Light**, **Dark**, and **System**:

```tsx
// components/mode-toggle.tsx
"use client"

import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Select Theme" size="icon" variant="ghost">
          <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 3. Transition Glitch Prevention

The `ThemeProvider` sets `disableTransitionOnChange={true}`. This suppresses CSS transitions momentarily when switching themes, preventing jarring color flashes or visual stutter on borders, fills, and shadows.

---

## 8. Summary Checklist for New Components

When building or updating UI components, verify:

- [ ] Uses semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`) rather than hardcoded hex, RGB, or raw color classes (`bg-white`, `border-[#C7C7C7]`).
- [ ] Zero manual `dark:` overrides on standard component surfaces.
- [ ] Interactive controls support focus rings via `outline-ring/50` or `ring-ring`.
- [ ] Printable areas enforce `print:bg-white print:text-black print:border-none print:shadow-none`.
- [ ] Non-text icon triggers provide accessible `aria-label` attributes.
- [ ] Passes `npm run format:check && npm run lint && npm run typecheck`.
