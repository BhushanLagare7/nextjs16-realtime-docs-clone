import type { AnyExtension, Extension } from "@tiptap/core"
import { Color } from "@tiptap/extension-color"
import { FontFamily } from "@tiptap/extension-font-family"
import { Highlight } from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import StarterKit from "@tiptap/starter-kit"

import { FontSizeExtension } from "@/extensions/font-size"
import { LineHeightExtension } from "@/extensions/line-height"

/**
 * Creates the complete array of Tiptap extensions configured for DocumentEditor.
 * Includes core typography, styling marks, block nodes, tables, task lists,
 * and optionally prepends the Liveblocks collaborative Yjs extension.
 *
 * @param liveblocksExtension - Optional Liveblocks extension instance configured for this room.
 * @returns Array of configured Tiptap extensions.
 */
export function createEditorExtensions(
  liveblocksExtension?: Extension | AnyExtension
): AnyExtension[] {
  return [
    ...(liveblocksExtension ? [liveblocksExtension] : []),
    StarterKit.configure({
      link: false,
      undoRedo: false,
    }),
    LineHeightExtension,
    FontSizeExtension,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
    }),
    FontFamily,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    // Enables resizable inline images
    Image.configure({
      resize: {
        enabled: true,
      },
    }),
    // Table support with resizable columns
    Table.configure({
      resizable: true,
    }),
    TableCell,
    TableHeader,
    TableRow,
    // Nested task lists (checkboxes)
    TaskItem.configure({
      nested: true,
    }),
    TaskList,
  ]
}

export { createEditorExtensions as getEditorExtensions }
