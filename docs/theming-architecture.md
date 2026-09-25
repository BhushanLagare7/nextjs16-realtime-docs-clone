# High-Level Theming Architecture & Invariants

This document establishes the architecture and core invariant rules for the **tri-theme model** across all layers of the stack: **Next.js 16**, **Tailwind CSS v4**, **shadcn/ui**, **Tiptap rich-text editor**, **Liveblocks multiplayer UI**, and **Clerk authentication**.

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
   - The root `<html>` element in [`app/layout.tsx`](../app/layout.tsx) MUST include `suppressHydrationWarning` to prevent React hydration mismatch warnings when `next-themes` updates the `class` attribute before mounting.
2. **Zero Manual `dark:` Color Overrides**:
   - NEVER use manual class combinations such as `bg-white dark:bg-zinc-900` or `text-black dark:text-white` on components.
   - ALWAYS use semantic tokens (e.g. `bg-background text-foreground`, `bg-card text-card-foreground`). Semantic tokens resolve automatically to their respective `:root` or `.dark` CSS variables.
3. **Print Media Isolation**:
   - The document canvas MUST print strictly in paper white with black ink regardless of whether the user is actively viewing in dark or light mode (`print:bg-white print:text-black print:border-none print:shadow-none`).
   - Print utilities (`print:bg-white` and `print:text-black`) are explicitly permitted as an exception to the raw-color restriction to ensure physical paper output remains white with black text.
4. **User-Authored Document Formatting & Swatch Matrices**:
   - Color hex values applied to user document text or highlights (`textStyle`, `highlight`), along with color palette swatch matrices (`GOOGLE_DOCS_PALETTE` in `components/color-picker.tsx`), represent user-authored content and input values rather than component chrome or layout surfaces. They are explicitly permitted as content exceptions to the raw color restriction.
