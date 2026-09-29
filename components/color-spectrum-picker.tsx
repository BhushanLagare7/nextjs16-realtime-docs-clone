"use client"

import * as React from "react"
import { HexColorInput, HexColorPicker } from "react-colorful"

import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export interface ColorSpectrumPickerProps {
  /** Current color value in hex */
  color: string
  /** Callback fired when the custom color is committed */
  onApply: (color: string) => void
}

/**
 * Collapsible custom color spectrum picker powered by react-colorful.
 * Manages an isolated draft state so edits are committed only when "Apply" is clicked.
 */
export function ColorSpectrumPicker({
  color,
  onApply,
}: ColorSpectrumPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const safeColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#000000"
  const [prevColor, setPrevColor] = React.useState(color)
  const [draftColor, setDraftColor] = React.useState(safeColor)

  if (color !== prevColor) {
    setPrevColor(color)
    setDraftColor(safeColor)
  }

  const handleToggle = () => {
    if (!isOpen) {
      setDraftColor(safeColor)
    }
    setIsOpen((prev) => !prev)
  }

  const handleApply = () => {
    onApply(draftColor)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Custom
        </span>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-ring/50"
          type="button"
          onClick={handleToggle}
        >
          {isOpen ? (
            <XIcon className="size-3" />
          ) : (
            <PlusIcon className="size-3" />
          )}
          <span>{isOpen ? "Close" : "Custom color"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="custom-color-picker flex flex-col gap-2.5 pt-1">
          <HexColorPicker color={draftColor} onChange={setDraftColor} />
          <div className="flex items-center gap-2">
            <div
              className="size-7 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: draftColor }}
            />
            <div className="flex flex-1 items-center rounded-md border border-input bg-transparent px-2 focus-within:ring-1 focus-within:ring-ring">
              <span className="text-xs text-muted-foreground select-none">
                #
              </span>
              <HexColorInput
                className="h-7 w-full bg-transparent px-1 font-mono text-xs text-foreground uppercase focus:outline-hidden"
                color={draftColor}
                onChange={setDraftColor}
              />
            </div>
            <Button size="sm" type="button" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
