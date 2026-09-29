"use client"

import { useState } from "react"

import { ListCollapseIcon } from "lucide-react"

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

/**
 * Dropdown selector for setting line height / spacing
 * on block-level nodes (paragraph, heading).
 */
export function LineHeightButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)

  const lineHeights = [
    { label: "Default", value: "normal" },
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
  ]

  const currentLineHeight =
    (editor?.getAttributes("paragraph")?.lineHeight as string | undefined) ||
    (editor?.getAttributes("heading")?.lineHeight as string | undefined) ||
    "normal"

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Line spacing"
              className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            >
              <ListCollapseIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Line spacing</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {lineHeights.map(({ label, value }) => {
          const isLineHeightActive =
            currentLineHeight === value ||
            editor?.isActive({ lineHeight: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isLineHeightActive && "bg-muted-foreground/20"
              )}
              onClick={() => editor?.chain().focus().setLineHeight(value).run()}
            >
              <span className="text-sm whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
