"use client"

import { ColorPicker } from "@/components/color-picker"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Dropdown selector for setting text color on selected text using ColorPicker.
 */
export function TextColorButton() {
  const { editor } = useEditorStore()

  const currentColor =
    (editor?.getAttributes("textStyle")?.color as string | undefined) ||
    "#000000"

  const hasColor = !!editor?.getAttributes("textStyle")?.color

  const onChange = (color: string) => {
    editor?.chain().focus().setColor(color).run()
  }

  const onReset = () => {
    editor?.chain().focus().unsetColor().run()
  }

  return (
    <ColorPicker
      aria-label="Text color"
      isResetActive={!hasColor}
      resetLabel="Default"
      resetType="default"
      tooltip="Text color"
      value={currentColor}
      onChange={onChange}
      onReset={onReset}
    >
      <button
        aria-label="Text color"
        className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
      >
        <span className="text-xs">A</span>
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: hasColor ? currentColor : "currentColor" }}
        />
      </button>
    </ColorPicker>
  )
}
