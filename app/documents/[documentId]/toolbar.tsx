"use client"

import { type LucideIcon, Undo2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

interface ToolbarButtonProps {
  /** Handler invoked when the button is clicked */
  onClick?: () => void
  /** Whether the button represents an active/enabled editor state */
  isActive?: boolean
  /** Icon component to render inside the button */
  icon: LucideIcon
  "aria-label"?: string
}

/** Small icon-only button used within the editor toolbar */
function ToolbarButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isActive,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-sm text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
        isActive && "bg-muted-foreground/20"
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )
}

/**
 * Editor toolbar containing action buttons (e.g. Undo) that operate
 * on the currently active Tiptap editor instance from the global store.
 */
export function Toolbar() {
  const { editor } = useEditorStore()

  // Grouped toolbar buttons; structured as sections for future extensibility
  const sections: {
    label: string
    icon: LucideIcon
    onClick: () => void
    isActive?: boolean
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
    ],
  ]

  return (
    <div className="flex min-h-10 items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden">
      {sections[0].map((item) => (
        <ToolbarButton
          key={item.label}
          aria-label={item.label}
          icon={item.icon}
          isActive={item.isActive}
          onClick={item.onClick}
        />
      ))}
    </div>
  )
}
