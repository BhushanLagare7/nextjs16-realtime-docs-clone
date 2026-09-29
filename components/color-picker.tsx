"use client"

import * as React from "react"

import { CheckIcon } from "lucide-react"

import { ColorSpectrumPicker } from "@/components/color-spectrum-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GOOGLE_DOCS_PALETTE, normalizeHex } from "@/constants/color-palette"
import { cn } from "@/lib/utils"

export interface ColorPickerProps {
  /** Trigger button or element rendered as popover anchor */
  children: React.ReactNode
  /** Accessible label for the popover */
  "aria-label"?: string
  /** Whether the reset option is currently active */
  isResetActive?: boolean
  /** Label for the reset option (e.g. "Default" or "None") */
  resetLabel?: string
  /** Visual indicator type for the reset option */
  resetType?: "default" | "none"
  /** Currently selected color in hex format */
  value: string
  /** Optional hover tooltip for the trigger */
  tooltip?: string
  /** Callback fired when a color is selected */
  onChange: (color: string) => void
  /** Callback fired when the reset option is clicked */
  onReset?: () => void
}

/**
 * Google Docs-style color picker popover with standard 80-swatch matrix,
 * custom spectrum picker (via react-colorful), and theme-aware reset options.
 */
export function ColorPicker({
  "aria-label": ariaLabel,
  children,
  isResetActive,
  onChange,
  onReset,
  resetLabel,
  resetType = "none",
  tooltip,
  value,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)

  const normalizedCurrent = normalizeHex(value)

  /** Applies a swatch/custom color selection and closes the popover. */
  const handleSwatchSelect = (color: string) => {
    onChange(color)
    setOpen(false)
  }

  /** Triggers the reset callback and closes the popover. */
  const handleResetSelect = () => {
    onReset?.()
    setOpen(false)
  }

  const trigger = <PopoverTrigger asChild>{children}</PopoverTrigger>

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip open={open ? false : undefined}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <PopoverContent
        align="start"
        aria-label={ariaLabel}
        className="w-60.5 p-2.5"
        sideOffset={4}
      >
        {onReset && (
          <>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-ring/50",
                isResetActive && "bg-muted font-medium"
              )}
              type="button"
              onClick={handleResetSelect}
            >
              {resetType === "none" ? (
                <div className="relative flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border">
                  <div className="absolute h-0.5 w-full -rotate-45 bg-destructive" />
                </div>
              ) : (
                <div className="size-4 shrink-0 rounded-full border border-border bg-foreground" />
              )}
              <span>
                {resetLabel ?? (resetType === "none" ? "None" : "Default")}
              </span>
              {isResetActive && (
                <CheckIcon className="ml-auto size-3.5 text-foreground" />
              )}
            </button>
            <Separator className="my-1.5" />
          </>
        )}

        {/* Standard Google Docs 80-swatch matrix */}
        <div className="grid grid-cols-10 gap-1">
          {GOOGLE_DOCS_PALETTE.map((color) => {
            const isSelected =
              !isResetActive && normalizeHex(color) === normalizedCurrent

            return (
              <button
                key={color}
                aria-label={color}
                className={cn(
                  "size-4.5 rounded-full border border-border/40 transition-transform hover:scale-125 focus-visible:outline-ring/50",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-1 ring-offset-popover"
                )}
                style={{ backgroundColor: color }}
                type="button"
                onClick={() => handleSwatchSelect(color)}
              />
            )
          })}
        </div>

        <Separator className="my-2" />

        {/* Custom spectrum picker section */}
        <ColorSpectrumPicker
          color={normalizedCurrent}
          onApply={handleSwatchSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
