"use client"

import * as React from "react"
import { HexColorInput, HexColorPicker } from "react-colorful"

import { CheckIcon, PlusIcon, XIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * Standard 80-color Google Docs color palette (10 columns x 8 rows).
 * Row 1: Grayscale / Neutrals
 * Row 2: Base vibrant hues
 * Rows 3-8: Tints and shades from lightest to deepest
 */
const GOOGLE_DOCS_PALETTE: readonly string[] = [
  // Row 1: Grayscale
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  // Row 2: Base vibrant hues
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  // Row 3: Light tint 1
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  // Row 4: Light tint 2
  "#dd7e6b",
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#a4c2f4",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
  // Row 5: Medium tint
  "#cc4125",
  "#e06666",
  "#f6b26b",
  "#ffd966",
  "#93c47d",
  "#76a5af",
  "#6d9eeb",
  "#6fa8dc",
  "#8e7cc3",
  "#c27ba0",
  // Row 6: Dark tint
  "#a61c1c",
  "#cc0000",
  "#e69138",
  "#f1c232",
  "#6aa84f",
  "#45818e",
  "#3c78d8",
  "#3d85c6",
  "#674ea7",
  "#a64d79",
  // Row 7: Deep
  "#85200c",
  "#990000",
  "#b45f06",
  "#bf9000",
  "#38761d",
  "#134f5c",
  "#1155cc",
  "#0b5394",
  "#351c75",
  "#741b47",
  // Row 8: Very deep
  "#5b0f00",
  "#660000",
  "#783f04",
  "#7f6000",
  "#274e13",
  "#0c343d",
  "#1c4587",
  "#073763",
  "#20124d",
  "#4c1130",
] as const

/**
 * Normalizes a hex string to lowercase 6-character hex format (#rrggbb).
 */
function normalizeHex(color?: string): string {
  if (!color) return "#000000"
  if (color.startsWith("#")) {
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase()
    }
    if (color.length === 7) {
      return color.toLowerCase()
    }
  }
  return color.toLowerCase()
}

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
  value,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [isCustomOpen, setIsCustomOpen] = React.useState(false)

  const normalizedCurrent = normalizeHex(value)
  const safeCustomColor = /^#[0-9a-f]{6}$/i.test(normalizedCurrent)
    ? normalizedCurrent
    : "#000000"

  const handleSwatchSelect = (color: string) => {
    onChange(color)
    setOpen(false)
  }

  const handleResetSelect = () => {
    onReset?.()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Custom
            </span>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-ring/50"
              type="button"
              onClick={() => setIsCustomOpen(!isCustomOpen)}
            >
              {isCustomOpen ? (
                <XIcon className="size-3" />
              ) : (
                <PlusIcon className="size-3" />
              )}
              <span>{isCustomOpen ? "Close" : "Custom color"}</span>
            </button>
          </div>

          {isCustomOpen && (
            <div className="custom-color-picker flex flex-col gap-2.5 pt-1">
              <HexColorPicker color={safeCustomColor} onChange={onChange} />
              <div className="flex items-center gap-2">
                <div
                  className="size-7 shrink-0 rounded-md border border-border"
                  style={{ backgroundColor: safeCustomColor }}
                />
                <div className="flex flex-1 items-center rounded-md border border-input bg-transparent px-2 focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-xs text-muted-foreground select-none">
                    #
                  </span>
                  <HexColorInput
                    className="h-7 w-full bg-transparent px-1 font-mono text-xs text-foreground uppercase focus:outline-hidden"
                    color={safeCustomColor}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
