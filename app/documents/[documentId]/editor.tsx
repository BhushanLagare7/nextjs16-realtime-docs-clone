"use client"

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
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { FontSizeExtension } from "@/extensions/font-size"
import { LineHeightExtension } from "@/extensions/line-height"
import { useEditorStore } from "@/store/use-editor-store"

interface DocumentEditorProps {
  /** ID of the document being edited (currently unused, reserved for future persistence logic) */
  documentId?: string
}

/**
 * Renders a Tiptap-based rich text editor for a document.
 * Syncs the live editor instance to the global editor store so that
 * external components (e.g. Toolbar) can access editor state/commands.
 *
 * Using useEditor hook API with EditorContent for single-component editor lifecycle.
 */
export function DocumentEditor({ documentId }: DocumentEditorProps) {
  void documentId // reserved for future use (e.g. loading/saving document content)

  const { setEditor } = useEditorStore()

  const editor = useEditor({
    immediatelyRender: false,
    // Keep the global store in sync with the editor instance across its lifecycle
    onCreate({ editor }) {
      setEditor(editor)
    },
    onDestroy() {
      setEditor(null)
    },
    onUpdate({ editor }) {
      setEditor(editor)
    },
    onSelectionUpdate({ editor }) {
      setEditor(editor)
    },
    onTransaction({ editor }) {
      setEditor(editor)
    },
    onFocus({ editor }) {
      setEditor(editor)
    },
    onBlur({ editor }) {
      setEditor(editor)
    },
    onContentError({ editor }) {
      setEditor(editor)
    },
    editorProps: {
      attributes: {
        // Emulates a page-like editing surface (fixed width/height, print-friendly styles)
        style: "padding-left: 56px; padding-right: 56px;",
        class:
          "focus:outline-none print:border-0 bg-card text-card-foreground border border-border shadow-xs flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text print:bg-white print:text-black print:border-none print:shadow-none",
      },
    },
    extensions: [
      StarterKit.configure({
        link: false,
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
    ],
    // Default/placeholder content for demonstration purposes
    content: `
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th colspan="3">Description</th>
          </tr>
          <tr>
            <td>Cyndi Lauper</td>
            <td>Singer</td>
            <td>Songwriter</td>
            <td>Actress</td>
          </tr>
        </tbody>
      </table>
    `,
  })

  return (
    // Scrollable container that centers the "page" and adapts for print
    <div className="size-full flex-1 overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// Alias export for convenience/backward compatibility
export { DocumentEditor as Editor }
