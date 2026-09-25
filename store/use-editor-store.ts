import { type Editor } from "@tiptap/react"
import { create } from "zustand"

interface EditorState {
  /** The currently active Tiptap editor instance, or null if none is mounted */
  editor: Editor | null
  /** Sets/updates the active editor instance in the store */
  setEditor: (editor: Editor | null) => void
  /** Current left page margin in pixels applied to the editor surface */
  leftMargin: number
  /** Sets/updates the left page margin */
  setLeftMargin: (leftMargin: number) => void
  /** Current right page margin in pixels applied to the editor surface */
  rightMargin: number
  /** Sets/updates the right page margin */
  setRightMargin: (rightMargin: number) => void
}

/**
 * Global store for sharing the active Tiptap editor instance and document page margins
 * across components (e.g. between the editor, toolbar, and ruler).
 */
export const useEditorStore = create<EditorState>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
  leftMargin: 56,
  setLeftMargin: (leftMargin) => set({ leftMargin }),
  rightMargin: 56,
  setRightMargin: (rightMargin) => set({ rightMargin }),
}))
