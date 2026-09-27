# Tiptap Toolbar Component Pattern

This document details the implementation pattern, structure, and button conventions of the **Tiptap document toolbar**.

---

## 1. Toolbar Component Pattern

The document toolbar (`app/documents/[documentId]/toolbar.tsx`) reads state and executes commands against the active editor stored in `useEditorStore`. Controls are organized into grouped multi-dimensional sections (`sections: { label, icon, onClick, isActive?, tooltip? }[][]`) rendered as compact, accessible buttons inside a semantic pill container (`min-h-10 flex items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden`).

### Tooltip Architecture & Delay

1. **Global Provider Wrapping**: The entire toolbar container is wrapped in `<TooltipProvider delayDuration={300}>`, ensuring consistent 300ms hover delay across all toolbar controls.
2. **`ToolbarButton` Pattern**: Wraps the trigger button in `<Tooltip>`, using `tooltip ?? label` for accessible hover hints.
3. **Dropdown & Popover Tooltip Suppression**: For complex controls (`FontFamilyButton`, `HeadingLevelButton`, `FontSizeButton`, `AlignButton`, `LineHeightButton`, `ListButton`, `TextColorButton`, `HighlightColorButton`, `LinkButton`, `ImageButton`), tooltips must be suppressed when the dropdown or popover is open. Track `open` state and pass `open={open ? false : undefined}` to `<Tooltip>` wrapping `<TooltipTrigger asChild>`:

```tsx
// app/documents/[documentId]/toolbar.tsx
"use client"

import { useState } from "react"
import { type LucideIcon, Undo2Icon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

interface ToolbarButtonProps {
  onClick?: () => void
  isActive?: boolean
  icon: LucideIcon
  label?: string
  tooltip?: string
  "aria-label"?: string
}

function ToolbarButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isActive,
  label,
  onClick,
  tooltip,
}: ToolbarButtonProps) {
  const button = (
    <button
      aria-label={ariaLabel ?? label}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-sm text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
        isActive && "bg-muted-foreground/20"
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )

  const tooltipText = tooltip ?? label
  if (!tooltipText) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
```
