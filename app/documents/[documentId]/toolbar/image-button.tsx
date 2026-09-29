"use client"

import { useRef, useState } from "react"

import { useConvex, useMutation } from "convex/react"
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
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
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
  const convex = useConvex()
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run()
  }

  /** Opens a native file picker and uploads the selected image to Convex storage */
  const onUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // 1. Get a short-lived upload URL from Convex
        const uploadUrl = await generateUploadUrl()

        // 2. POST the file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`)
        }

        const { storageId } = (await result.json()) as {
          storageId: Id<"_storage">
        }

        // 3. Resolve the storage ID to a persistent public URL
        const storageUrl = await convex.query(api.storage.getUrl, {
          storageId,
        })

        if (storageUrl) {
          onChange(storageUrl)
        }
      } catch (error) {
        console.error("Image upload failed:", error)
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
