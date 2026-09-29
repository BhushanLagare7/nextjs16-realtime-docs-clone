"use client"

import { useEffect } from "react"

import { useStorage } from "@liveblocks/react/suspense"
import { useLiveblocksExtension } from "@liveblocks/react-tiptap"
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

import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins"
import { FontSizeExtension } from "@/extensions/font-size"
import { LineHeightExtension } from "@/extensions/line-height"
import { useEditorStore } from "@/store/use-editor-store"

import { Ruler } from "./ruler"
import { Threads } from "./threads"

interface DocumentEditorProps {
  /** ID of the document being edited (currently unused, reserved for future persistence logic) */
  documentId?: string
  /** Initial content loaded when the document is first created */
  initialContent?: string
}

/**
 * Renders a Tiptap-based rich text editor for a document.
 * Syncs the live editor instance to the global editor store so that
 * external components (e.g. Toolbar) can access editor state/commands.
 *
 * Using useEditor hook API with EditorContent for single-component editor lifecycle.
 */
export function DocumentEditor({
  documentId,
  initialContent,
}: DocumentEditorProps) {
  void documentId // reserved for future use (e.g. loading/saving document content)

  const leftMargin =
    useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT
  const rightMargin =
    useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT

  const liveblocks = useLiveblocksExtension({
    initialContent,
    offlineSupport_experimental: true,
  })
  const { setEditor } = useEditorStore()

  const editor = useEditor({
    autofocus: true,
    immediatelyRender: false,
    enableContentCheck: true,
    onDestroy() {
      setEditor(null)
    },
    onUpdate({ editor: ed }) {
      setEditor(ed)
    },
    onSelectionUpdate({ editor: ed }) {
      setEditor(ed)
    },
    onTransaction({ editor: ed }) {
      setEditor(ed)
    },
    onFocus({ editor: ed }) {
      setEditor(ed)
    },
    onBlur({ editor: ed }) {
      setEditor(ed)
    },
    onContentError({ editor: ed, error, disableCollaboration }) {
      disableCollaboration?.()
      ed.setEditable(false, false)
      console.error("Content validation error:", error)
      setEditor(ed)
    },
    editorProps: {
      attributes: {
        // Emulates a page-like editing surface (fixed width/height, print-friendly styles)
        style: `--page-margin-left: ${leftMargin}px; --page-margin-right: ${rightMargin}px;`,
        class:
          "focus:outline-none print:border-0 bg-card text-card-foreground border border-border shadow-xs flex flex-col min-h-[1054px] w-[816px] pt-10 pb-10 pl-[var(--page-margin-left,56px)] pr-[var(--page-margin-right,56px)] cursor-text print:bg-white print:text-black print:border-none print:p-0 print:shadow-none",
      },
    },
    extensions: [
      liveblocks,
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
    ],
  })

  // Sync the editor instance to the global store via useEffect so the
  // Zustand store update never fires during React's render phase.
  useEffect(() => {
    setEditor(editor ?? null)
    return () => setEditor(null)
  }, [editor, setEditor])

  // Reliably populate initialContent into the document when both the editor instance
  // and the Liveblocks Yjs provider are ready. With immediatelyRender: false in Next.js,
  // useLiveblocksExtension's internal effect runs on mount when editor.current is null,
  // and because its dependency array does not track editor creation, initialContent is dropped
  // if the Liveblocks room connection was already established before mounting.
  useEffect(() => {
    if (!editor || !initialContent) return

    interface LiveblocksExtensionStorage {
      doc?: {
        getMap: (name: string) => {
          get: (key: string) => unknown
          set: (key: string, value: unknown) => void
        }
      }
      provider?: {
        getStatus: () => string
        off: (event: string, cb: (...args: unknown[]) => void) => void
        on: (event: string, cb: (...args: unknown[]) => void) => void
      }
    }

    const storage = (
      editor.storage as unknown as Record<
        string,
        LiveblocksExtensionStorage | undefined
      >
    ).liveblocksExtension

    const provider = storage?.provider
    const ydoc = storage?.doc

    if (!ydoc) return

    const applyInitialContent = () => {
      const config = ydoc.getMap("liveblocks_config")
      if (!config.get("hasContentSet") && editor.isEmpty) {
        config.set("hasContentSet", true)
        editor.commands.setContent(initialContent)
      }
    }

    const status = provider?.getStatus()
    if (!provider || status === "synchronizing" || status === "synchronized") {
      applyInitialContent()
    } else {
      const handleStatus = () => {
        const nextStatus = provider.getStatus()
        if (nextStatus === "synchronizing" || nextStatus === "synchronized") {
          applyInitialContent()
          provider.off("status", handleStatus)
        }
      }
      provider.on("status", handleStatus)
      return () => {
        provider.off("status", handleStatus)
      }
    }
  }, [editor, initialContent])

  return (
    // Scrollable container that centers the "page" and adapts for print
    <div className="size-full flex-1 overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0">
      <Ruler />
      <div className="relative mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0">
        <EditorContent editor={editor} />
        <Threads editor={editor} />
      </div>
    </div>
  )
}

// Alias export for convenience/backward compatibility
export { DocumentEditor as Editor }
