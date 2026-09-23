import { type Editor } from "@tiptap/react"
import { create } from "zustand"

interface EditorState {
  /** The currently active Tiptap editor instance, or null if none is mounted */
  editor: Editor | null
  /** Sets/updates the active editor instance in the store */
  setEditor: (editor: Editor | null) => void
}

/**
 * Global store for sharing the active Tiptap editor instance
 * across components (e.g. between the editor and toolbar).
 */
export const useEditorStore = create<EditorState>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
}))
