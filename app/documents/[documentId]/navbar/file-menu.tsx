"use client"

import { BsFilePdf } from "react-icons/bs"
import { useRouter } from "next/navigation"

import { useMutation } from "convex/react"
import {
  FileIcon,
  FileJsonIcon,
  FilePenIcon,
  FilePlusIcon,
  FileTextIcon,
  GlobeIcon,
  PrinterIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

import { RemoveDialog } from "@/components/remove-dialog"
import { RenameDialog } from "@/components/rename-dialog"
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { onSaveHTML, onSaveJSON, onSaveText } from "@/lib/document-export"
import { useEditorStore } from "@/store/use-editor-store"

/** Props for the FileMenu component. */
export interface FileMenuProps {
  data: Doc<"documents">
}

/**
 * Menubar section providing document file operations: save/export, create, rename, remove, print.
 */
export function FileMenu({ data }: FileMenuProps) {
  const router = useRouter()
  const { editor } = useEditorStore()
  const mutation = useMutation(api.documents.create)

  /** Creates a new blank document and navigates to it. */
  const onNewDocument = () => {
    mutation({
      title: "Untitled document",
      initialContent: "",
    })
      .then((id) => {
        toast.success("Document created")
        router.push(`/documents/${id}`)
      })
      .catch(() => {
        toast.error("Something went wrong")
      })
  }

  return (
    <MenubarMenu>
      <MenubarTrigger className="h-auto rounded-sm px-1.75 py-0.5 text-sm font-normal hover:bg-muted">
        File
      </MenubarTrigger>
      <MenubarContent className="print:hidden">
        <MenubarSub>
          <MenubarSubTrigger>
            <FileIcon />
            Save
          </MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={() => onSaveJSON(editor, data.title)}>
              <FileJsonIcon />
              JSON
            </MenubarItem>
            <MenubarItem onClick={() => onSaveHTML(editor, data.title)}>
              <GlobeIcon />
              HTML
            </MenubarItem>
            <MenubarItem onClick={() => window.print()}>
              <BsFilePdf />
              PDF
            </MenubarItem>
            <MenubarItem onClick={() => onSaveText(editor, data.title)}>
              <FileTextIcon />
              Text
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem onClick={onNewDocument}>
          <FilePlusIcon />
          New Document
        </MenubarItem>
        <MenubarSeparator />
        <RenameDialog documentId={data._id} initialTitle={data.title}>
          <MenubarItem
            onClick={(e) => e.stopPropagation()}
            onSelect={(e) => e.preventDefault()}
          >
            <FilePenIcon />
            Rename
          </MenubarItem>
        </RenameDialog>
        <RemoveDialog documentId={data._id}>
          <MenubarItem
            onClick={(e) => e.stopPropagation()}
            onSelect={(e) => e.preventDefault()}
          >
            <TrashIcon />
            Remove
          </MenubarItem>
        </RemoveDialog>
        <MenubarSeparator />
        <MenubarItem onClick={() => window.print()}>
          <PrinterIcon />
          Print <MenubarShortcut>⌘P</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}
