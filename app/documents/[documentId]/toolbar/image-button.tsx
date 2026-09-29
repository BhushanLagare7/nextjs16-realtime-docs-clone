"use client"

import { useRef, useState } from "react"

import { ImageIcon, SearchIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Button and popover dialog for inserting images into the document,
 * either by uploading a local file or by providing an image URL.
 */
export function ImageButton() {
  const { editor } = useEditorStore()
  const [open, setOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const imageButtonRef = useRef<HTMLButtonElement | null>(null)

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run()
  }

  /** Opens a native file picker and inserts the selected image as an object URL */
  const onUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        onChange(imageUrl)
      }
    }

    input.click()
  }

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl)
      setImageUrl("")
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <Tooltip open={open ? false : undefined}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                ref={imageButtonRef}
                aria-label="Insert image"
                className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
              >
                <ImageIcon className="size-4" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Insert image</TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15"
            onClick={onUpload}
          >
            <UploadIcon className="size-4" />
            <span className="text-sm whitespace-nowrap">Upload</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15"
            onClick={() => setIsDialogOpen(true)}
          >
            <SearchIcon className="size-4" />
            <span className="text-sm whitespace-nowrap">Paste image URL</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setImageUrl("")
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onCloseAutoFocus={(e) => {
            // Return focus to the trigger button instead of the dialog's default target
            e.preventDefault()
            imageButtonRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>Insert image URL</DialogTitle>
            <DialogDescription className="sr-only">
              Enter the URL of the image to insert into the document.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleImageUrlSubmit()
              }
            }}
          />
          <DialogFooter>
            <Button onClick={handleImageUrlSubmit}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
