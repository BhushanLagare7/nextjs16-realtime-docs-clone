"use client"

import { HighlighterIcon } from "lucide-react"

import { ColorPicker } from "@/components/color-picker"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Dropdown selector for applying highlight color to selected text using ColorPicker.
 */
export function HighlightColorButton() {
  const { editor } = useEditorStore()

  const currentColor =
    (editor?.getAttributes("highlight")?.color as string | undefined) ||
    "#ffff00"

  const isHighlighted = !!editor?.isActive("highlight")

  const onChange = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run()
  }

  const onReset = () => {
    editor?.chain().focus().unsetHighlight().run()
  }

  return (
    <ColorPicker
      aria-label="Highlight color"
      isResetActive={!isHighlighted}
      resetLabel="None"
      resetType="none"
      tooltip="Highlight color"
      value={isHighlighted ? currentColor : "#ffff00"}
      onChange={onChange}
      onReset={onReset}
    >
      <button
        aria-label="Highlight color"
        className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
      >
        <HighlighterIcon className="size-4" />
        <div
          className="h-0.5 w-full"
          style={{
            backgroundColor: isHighlighted ? currentColor : "transparent",
          }}
        />
      </button>
    </ColorPicker>
  )
}
