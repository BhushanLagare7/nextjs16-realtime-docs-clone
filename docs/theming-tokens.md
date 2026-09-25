# Tailwind CSS v4 & OKLCH Semantic Tokens

This document details the OKLCH semantic color token configuration, token pairing matrix, and status indicators in **Tailwind CSS v4**.

---

## 1. Tailwind CSS v4 & OKLCH Semantic Tokens

All colors are defined in [`app/globals.css`](../app/globals.css) using the **OKLCH** color model (`oklch(L C H)`), which offers uniform perceived lightness and superior color rendering across displays.

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
