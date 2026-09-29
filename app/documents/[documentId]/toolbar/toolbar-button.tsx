"use client"

import { type LucideIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface ToolbarButtonProps {
  /** Handler invoked when the button is clicked */
  onClick?: () => void
  /** Whether the button represents an active/enabled editor state */
  isActive?: boolean
  /** Icon component to render inside the button */
  icon: LucideIcon
  /** Accessible name for screen readers; falls back to `label` if omitted */
  "aria-label"?: string
  /** Human-readable label fallback for aria-label */
  label?: string
  /** Descriptive tooltip text to show on hover */
  tooltip?: string
}

/** Small icon-only button used within the editor toolbar */
export function ToolbarButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isActive,
  label,
  onClick,
  tooltip,
}: ToolbarButtonProps) {
  const tooltipText = tooltip ?? label ?? ariaLabel

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      {tooltipText && <TooltipContent>{tooltipText}</TooltipContent>}
    </Tooltip>
  )
}
