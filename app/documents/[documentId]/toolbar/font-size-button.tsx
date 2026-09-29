"use client"

import { useState } from "react"

import { MinusIcon, PlusIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "@/extensions/font-size"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Control for adjusting font size of selected text via decrement/increment
 * buttons or direct numerical input.
 */
export function FontSizeButton() {
  const { editor } = useEditorStore()

  const currentFontSize =
    (
      editor?.getAttributes("textStyle")?.fontSize as string | undefined
    )?.replace("px", "") || "16"

  const [fontSize, setFontSize] = useState(currentFontSize)
  const [inputValue, setInputValue] = useState(fontSize)
  const [isEditing, setIsEditing] = useState(false)

  // Keep internal state in sync with editor when not actively editing
  if (!isEditing && fontSize !== currentFontSize) {
    setFontSize(currentFontSize)
    setInputValue(currentFontSize)
  }

  /**
   * Validates and applies a new font size to the editor.
   * Reverts to the previous value if the input is invalid or out of range.
   */
  const updateFontSize = (newSize: string) => {
    const trimmed = newSize.trim()
    if (!/^\d+$/.test(trimmed)) {
      setInputValue(fontSize)
      setIsEditing(false)
      return
    }

    const size = parseInt(trimmed, 10)
    if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
      editor?.chain().focus().setFontSize(`${size}px`).run()
      setFontSize(size.toString())
      setInputValue(size.toString())
      setIsEditing(false)
    } else {
      setInputValue(fontSize)
      setIsEditing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    updateFontSize(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      updateFontSize(inputValue)
      editor?.commands.focus()
    }
  }

  const increment = () => {
    const newSize = parseInt(fontSize, 10) + 1
    if (newSize <= MAX_FONT_SIZE) {
      updateFontSize(newSize.toString())
    }
  }

  const decrement = () => {
    const newSize = parseInt(fontSize, 10) - 1
    if (newSize >= MIN_FONT_SIZE) {
      updateFontSize(newSize.toString())
    }
  }

  return (
    <div className="flex items-center gap-x-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Decrease font size"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            type="button"
            onClick={decrement}
          >
            <MinusIcon className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Decrease font size</TooltipContent>
      </Tooltip>
      {isEditing ? (
        <input
          aria-label="Font size value"
          autoFocus
          className="h-7 w-10 rounded-sm border border-input bg-transparent text-center text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          type="text"
          value={inputValue}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Font size"
              className="flex h-7 w-10 shrink-0 items-center justify-center rounded-sm border border-input text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
              type="button"
              onClick={() => {
                setIsEditing(true)
                setFontSize(currentFontSize)
                setInputValue(currentFontSize)
              }}
            >
              {currentFontSize}
            </button>
          </TooltipTrigger>
          <TooltipContent>Font size</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Increase font size"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            type="button"
            onClick={increment}
          >
            <PlusIcon className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Increase font size</TooltipContent>
      </Tooltip>
    </div>
  )
}
