# Theme Switching Controls & UX

This document details the theme toggle controls, global hotkeys, and transition glitch prevention in **Next.js 16** with **next-themes**.

---

## 1. Theme Switching Controls & UX

### Global Keyboard Shortcut

Configured in [`components/theme-provider.tsx`](../components/theme-provider.tsx):

- Pressing **`d`** toggles between `light` and `dark`.
- The hotkey listener inspects `event.target` to safely ignore keystrokes inside `input`, `textarea`, `select`, or any `contentEditable` element (preventing accidental toggling while drafting documents in Tiptap).

### Mode Toggle Component Pattern

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

### Transition Glitch Prevention

The `ThemeProvider` sets `disableTransitionOnChange={true}`. This suppresses CSS transitions momentarily when switching themes, preventing jarring color flashes or visual stutter on borders, fills, and shadows.
