"use client"

import { useState } from "react"

import { ListIcon, ListOrderedIcon } from "lucide-react"

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
 * Dropdown selector for toggling bullet or ordered lists.
 */
export function ListButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)

  const lists = [
    {
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      label: "Bullet List",
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      label: "Ordered List",
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ]

  const isAnyListActive =
    editor?.isActive("bulletList") || editor?.isActive("orderedList")

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="List options"
              className={cn(
                "flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
                isAnyListActive && "bg-muted-foreground/20"
              )}
            >
              <ListIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>List options</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {lists.map(({ icon: Icon, isActive, label, onClick }) => (
          <DropdownMenuItem
            key={label}
            className={cn(
              "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
              isActive() && "bg-muted-foreground/20"
            )}
            onClick={onClick}
          >
            <Icon className="size-4" />
            <span className="text-sm whitespace-nowrap">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
