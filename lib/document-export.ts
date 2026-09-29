import type { Editor } from "@tiptap/react"

/**
 * Triggers a browser download for the given blob using the provided filename.
 */
export function onDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Exports the current document content as a JSON file.
 */
export function onSaveJSON(editor: Editor | null, title: string): void {
  if (!editor) return

  const content = editor.getJSON()
  const blob = new Blob([JSON.stringify(content)], {
    type: "application/json",
  })
  onDownload(blob, `${title}.json`)
}

/**
 * Exports the current document content as an HTML file.
 */
export function onSaveHTML(editor: Editor | null, title: string): void {
  if (!editor) return

  const content = editor.getHTML()
  const blob = new Blob([content], {
    type: "text/html",
  })
  onDownload(blob, `${title}.html`)
}

/**
 * Exports the current document content as a plain text file.
 */
export function onSaveText(editor: Editor | null, title: string): void {
  if (!editor) return

  const content = editor.getText()
  const blob = new Blob([content], {
    type: "text/plain",
  })
  onDownload(blob, `${title}.txt`)
}
