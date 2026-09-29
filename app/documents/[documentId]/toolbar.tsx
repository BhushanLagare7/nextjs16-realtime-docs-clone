"use client"

import {
  BoldIcon,
  ItalicIcon,
  ListTodoIcon,
  type LucideIcon,
  MessageSquarePlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/use-editor-store"

import { AlignButton } from "./toolbar/align-button"
import { FontFamilyButton } from "./toolbar/font-family-button"
import { FontSizeButton } from "./toolbar/font-size-button"
import { HeadingLevelButton } from "./toolbar/heading-level-button"
import { HighlightColorButton } from "./toolbar/highlight-color-button"
import { ImageButton } from "./toolbar/image-button"
import { LineHeightButton } from "./toolbar/line-height-button"
import { LinkButton } from "./toolbar/link-button"
import { ListButton } from "./toolbar/list-button"
import { TextColorButton } from "./toolbar/text-color-button"
import { ToolbarButton } from "./toolbar/toolbar-button"

/**
 * Editor toolbar containing action buttons (e.g. Undo) that operate
 * on the currently active Tiptap editor instance from the global store.
 */
export function Toolbar() {
  const { editor } = useEditorStore()

  // Grouped toolbar buttons; structured as sections for future extensibility
  const sections: {
    label: string
    icon: LucideIcon
    onClick: () => void
    isActive?: boolean
    tooltip?: string
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: "Spell Check",
        tooltip: "Spelling and grammar check",
        icon: SpellCheckIcon,
        onClick: () => {
          // Toggle the native spellcheck attribute on the editor's DOM node
          const current = editor?.view.dom.getAttribute("spellcheck")
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false"
          )
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        isActive: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        isActive: editor?.isActive("underline"),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "Comment",
        tooltip: "Add comment",
        icon: MessageSquarePlusIcon,
        onClick: () => editor?.chain().focus().addPendingComment().run(),
        isActive: editor?.isActive("liveblocksCommentMark"),
      },
      {
        label: "List Todo",
        tooltip: "Checklist",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        tooltip: "Clear formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-10 items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden">
        {sections[0].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <Separator className="h-6" orientation="vertical" />
        <FontFamilyButton />
        <Separator className="h-6" orientation="vertical" />
        <HeadingLevelButton />
        <Separator className="h-6" orientation="vertical" />
        <FontSizeButton />
        <Separator className="h-6" orientation="vertical" />
        {sections[1].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <TextColorButton />
        <HighlightColorButton />
        <Separator className="h-6" orientation="vertical" />
        <LinkButton />
        <ImageButton />
        <AlignButton />
        <LineHeightButton />
        <ListButton />
        {sections[2].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
      </div>
    </TooltipProvider>
  )
}
