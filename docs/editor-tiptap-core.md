# Tiptap Core Architecture & Schema Invariants

This document details the configuration, engine setup, and ProseMirror schema constraints of the **Tiptap rich-text editor**.

---

## 1. Core Architecture & Tiptap Engine

The document editor is powered by Tiptap v3. It integrates with ProseMirror under the hood, running in a headless client component:

- **Editor Hook**: Initialized via `useEditor` from `@tiptap/react`. Always set `immediatelyRender: false` in Next.js App Router to avoid React 19 SSR hydration mismatch warnings.
- **Canonical Component & Exports**: The core document editor component is named `DocumentEditor` located at `app/documents/[documentId]/editor.tsx` and accepts `DocumentEditorProps` (`{ documentId?: string }`). An alias export `export { DocumentEditor as Editor }` is provided for backwards compatibility.
- **Editor Store**: Centralized in the global Zustand store (`store/use-editor-store.ts`), managing both the active editor instance (registered via `useEditor` lifecycle callbacks) and document margins (`leftMargin`, `rightMargin`, `setLeftMargin`, `setRightMargin`, defaulting to 56px) so toolbar controls, ruler handles, and canvas padding remain synchronized.
- **Core Extensions Configuration**: Standard editor extensions include `StarterKit.configure({ link: false, undoRedo: false })` (which bundles `Underline`, `Bold`, `Italic`, `Strike`, `BulletList`, `OrderedList`, etc. by default in Tiptap v3; `link` is disabled to prevent duplicate extension registration with the custom `Link` setup, and `undoRedo` is disabled because collaborative history is managed directly by Liveblocks CRDT bindings), `TextAlign.configure({ types: ["heading", "paragraph"] })`, `FontFamily`, `TextStyle`, `Color`, `Highlight.configure({ multicolor: true })`, `Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" })`, `Image.configure({ resize: { enabled: true } })`, `Table.configure({ resizable: true })`, `TableCell`, `TableHeader`, `TableRow`, `TaskItem.configure({ nested: true })`, `TaskList`, and custom extensions `FontSizeExtension` and `LineHeightExtension`. Do not register standalone `Underline` alongside default `StarterKit` to avoid duplicate extension warnings.
- **Content Validation & Error Handling**: Enable `enableContentCheck: true` on `useEditor` to validate incoming schema operations. In `onContentError({ editor, error, disableCollaboration })`, invoke `disableCollaboration?.()` and set `editor.setEditable(false, false)` to halt synchronization gracefully upon schema or state corruption.
- **Native Image Resizing (Tiptap v3)**: Tiptap v3 incorporates resizable node views directly in `@tiptap/extension-image` via `Image.configure({ resize: { enabled: true } })`. Never register third-party extensions (e.g. `tiptap-extension-resize-image`) alongside `@tiptap/extension-image`, as duplicate node definitions cause editor warnings and inconsistent image parsing.
- **Content Persistence**: Content state is synchronized collaboratively with Liveblocks via `@liveblocks/react-tiptap` (`useLiveblocksExtension`).

---

## 2. Invariant Rule: Block vs. Text Node Attributes

> [!CAUTION]
> **NEVER apply block-level attributes to inline text nodes.**
> Attributes such as `textAlign`, `lineHeight`, or `margin` apply strictly to **block nodes** (`paragraph`, `heading`, `listItem`). Applying block attributes to text nodes corrupts the ProseMirror schema and crashes the editor.

### Attribute Placement Matrix

| Attribute    | Node Type              | Target Nodes           |
| :----------- | :--------------------- | :--------------------- |
| `fontFamily` | Inline (Mark / Style)  | `textStyle`            |
| `fontSize`   | Inline (Mark / Style)  | `textStyle`            |
| `color`      | Inline (Mark)          | `textStyle`            |
| `highlight`  | Inline (Mark)          | `highlight`            |
| `textAlign`  | Block (Node Attribute) | `paragraph`, `heading` |
| `lineHeight` | Block (Node Attribute) | `paragraph`, `heading` |
