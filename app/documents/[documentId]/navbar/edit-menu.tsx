"use client"

import { Redo2Icon, Undo2Icon } from "lucide-react"

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Menubar section providing document edit operations: undo and redo.
 */
export function EditMenu() {
  const { editor } = useEditorStore()

  return (
    <MenubarMenu>
      <MenubarTrigger className="h-auto rounded-sm px-1.75 py-0.5 text-sm font-normal hover:bg-muted">
        Edit
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2Icon />
          Undo <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2Icon />
          Redo <MenubarShortcut>⌘Y</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}
