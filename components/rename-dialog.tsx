"use client"

import { useState } from "react"

import { useMutation } from "convex/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface RenameDialogProps {
  documentId: Id<"documents">
  initialTitle: string
  children: React.ReactNode
}

/** Modal dialog to rename a document. */
export function RenameDialog({
  documentId,
  initialTitle,
  children,
}: RenameDialogProps) {
  const update = useMutation(api.documents.updateById)
  const [isUpdating, setIsUpdating] = useState(false)

  const [title, setTitle] = useState(initialTitle)
  const [open, setOpen] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)

    update({ id: documentId, title: title.trim() || "Untitled" })
      .then(() => {
        toast.success("Document updated")
      })
      .catch(() => {
        toast.error("Something went wrong")
      })
      .finally(() => {
        setIsUpdating(false)
        setOpen(false)
      })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          setTitle(initialTitle)
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Rename document</DialogTitle>
            <DialogDescription>
              Enter a new name for this document
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Input
              placeholder="Document name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isUpdating}
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdating}
              type="submit"
              onClick={(e) => e.stopPropagation()}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
