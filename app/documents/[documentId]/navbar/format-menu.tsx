"use client"

import {
  BoldIcon,
  ItalicIcon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
} from "lucide-react"

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Menubar section providing text and document formatting controls.
 */
export function FormatMenu() {
  const { editor } = useEditorStore()

  return (
    <MenubarMenu>
      <MenubarTrigger className="h-auto rounded-sm px-1.75 py-0.5 text-sm font-normal hover:bg-muted">
        Format
      </MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>
            <TextIcon />
            Text
          </MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <BoldIcon />
              Bold <MenubarShortcut>⌘B</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon />
              Italic <MenubarShortcut>⌘I</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon />
              Underline <MenubarShortcut>⌘U</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <StrikethroughIcon />
              <span>Strikethrough&nbsp;&nbsp;</span>{" "}
              <MenubarShortcut>⌘⇧S</MenubarShortcut>
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem
          onClick={() => editor?.chain().focus().unsetAllMarks().run()}
        >
          <RemoveFormattingIcon />
          Clear formatting
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  )
}
