"use client"

import { useState } from "react"

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

/** A selectable font option shown in the font family dropdown */
export interface FontOption {
  /** Display text shown in the dropdown */
  label: string
  /** CSS font-family value applied to selected text */
  value: string
}

/**
 * Dropdown selector for setting the font family of selected text.
 */
export function FontFamilyButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)

  const fonts: FontOption[] = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Font family"
              className="flex h-7 w-30 shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
            >
              <span className="truncate">
                {(editor?.getAttributes("textStyle")?.fontFamily as
                  string | undefined) || "Arial"}
              </span>
              <ChevronDownIcon className="ml-2 size-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Font</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {fonts.map(({ label, value }) => {
          const isFontActive =
            editor?.getAttributes("textStyle")?.fontFamily === value

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isFontActive && "bg-muted-foreground/20"
              )}
              style={{ fontFamily: value }}
              onClick={() => editor?.chain().focus().setFontFamily(value).run()}
            >
              <span className="text-sm whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
