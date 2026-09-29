"use client"

import { useState } from "react"

import { Link2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Dropdown popover for setting or unsetting a hyperlink on selected text.
 */
export function LinkButton() {
  const { editor } = useEditorStore()
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)

  /**
   * Applies or removes a link on the current selection.
   * An empty value clears the link; otherwise the href is normalized
   * by prepending `https://` when no protocol or relative path is detected.
   */
  const onChange = (href: string) => {
    const trimmedHref = href.trim()

    if (trimmedHref === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      let normalizedHref = trimmedHref
      const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedHref)
      const isRelative =
        trimmedHref.startsWith("/") ||
        trimmedHref.startsWith("#") ||
        trimmedHref.startsWith(".") ||
        trimmedHref.startsWith("?") ||
        trimmedHref.startsWith("//")

      if (!hasProtocol && !isRelative) {
        normalizedHref = `https://${trimmedHref}`
      }

      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalizedHref })
        .run()
    }
    setValue("")
    setOpen(false)
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          setValue(
            (editor?.getAttributes("link")?.href as string | undefined) || ""
          )
        }
      }}
    >
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Insert link"
              className={cn(
                "flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
                editor?.isActive("link") && "bg-muted-foreground/20"
              )}
            >
              <Link2Icon className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Insert link</TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="flex w-80 items-center gap-x-2 p-2.5">
        <Input
          className="flex-1"
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") {
              onChange(value)
            }
          }}
        />
        <Button onClick={() => onChange(value)}>Apply</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
