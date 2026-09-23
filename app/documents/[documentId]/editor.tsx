"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface DocumentEditorProps {
  documentId?: string
}

// Using useEditor hook API with EditorContent for single-component editor lifecycle
export function DocumentEditor({ documentId }: DocumentEditorProps) {
  void documentId

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style: "padding-left: 56px; padding-right: 56px;",
        class:
          "focus:outline-none print:border-0 bg-card text-card-foreground border border-border shadow-xs flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text print:bg-white print:text-black print:border-none print:shadow-none",
      },
    },
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
  })

  return (
    <div className="size-full overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export { DocumentEditor as Editor }
