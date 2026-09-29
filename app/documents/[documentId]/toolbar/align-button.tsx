"use client"

import { useState } from "react"

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react"

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
 * Dropdown selector for setting text alignment (left, center, right, justify)
 * on block-level nodes (paragraph, heading).
 */
export function AlignButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)

  const alignments = [
    {
      icon: AlignLeftIcon,
      label: "Align Left",
      value: "left",
    },
    {
      icon: AlignCenterIcon,
      label: "Align Center",
      value: "center",
    },
    {
      icon: AlignRightIcon,
      label: "Align Right",
      value: "right",
    },
    {
      icon: AlignJustifyIcon,
      label: "Align Justify",
      value: "justify",
    },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Text alignment"
              className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            >
              <AlignLeftIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Align</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {alignments.map(({ icon: Icon, label, value }) => {
          const isAlignActive = editor?.isActive({ textAlign: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isAlignActive && "bg-muted-foreground/20"
              )}
              onClick={() => editor?.chain().focus().setTextAlign(value).run()}
            >
              <Icon className="size-4" />
              <span className="text-sm whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
