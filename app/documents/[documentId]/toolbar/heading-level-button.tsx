"use client"

import { useState } from "react"

import { type Level } from "@tiptap/extension-heading"
import { ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

/** A selectable heading option shown in the heading level dropdown */
export interface HeadingOption {
  /** Display text shown in the dropdown */
  label: string
  /** Heading level to apply, or `0` for normal paragraph text */
  value: 0 | Level
  /** Font size (CSS value) used to preview the option in the dropdown */
  fontSize: string
}

/**
 * Dropdown selector for setting the document heading level (H1 - H5)
 * or reverting back to normal body text (paragraph).
 */
export function HeadingLevelButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)

  const headings: HeadingOption[] = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ]

  /** Returns a human-readable label for the currently active heading level */
  const getCurrentHeading = (): string => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`
      }
    }

    return "Normal text"
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Text heading level"
              className="flex h-7 w-30 shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            >
              <span className="truncate">{getCurrentHeading()}</span>
              <ChevronDownIcon className="ml-2 size-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Styles</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {headings.map(({ fontSize, label, value }) => {
          const isHeadingActive =
            (value === 0 && !editor?.isActive("heading")) ||
            editor?.isActive("heading", { level: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isHeadingActive && "bg-muted-foreground/20"
              )}
              style={{ fontSize }}
              onClick={() => {
                if (value === 0) {
                  editor?.chain().focus().setParagraph().run()
                } else {
                  editor?.chain().focus().setHeading({ level: value }).run()
                }
              }}
            >
              <span className="whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
