# Document Navbar & Menubar Actions

This document details the navigation bar, title editing, menubar actions, and file export operations for the **Real-Time Collaborative Document Editor**.

---

## 1. Document Navbar & Menubar Actions (`navbar.tsx`)

The document navigation bar (`app/documents/[documentId]/navbar.tsx`) sits above the toolbar and coordinates document title editing (`DocumentInput`) and application-level operations via the accessible Radix UI Menubar (`components/ui/menubar.tsx`):

1. **Global Editor Instance Access**:
   - Reads `editor` from `useEditorStore` to execute top-level document mutations, serialization, and history operations.
2. **Document Export Operations (`onDownload`)**:
   - Employs a standardized client-side download helper creating temporary object URLs (`URL.createObjectURL(blob)`), programmatically dispatching an anchor click, and revoking the URL immediately via `URL.revokeObjectURL(url)` to release blob memory:
     - **JSON**: Serializes document nodes via `editor.getJSON()` into `new Blob([JSON.stringify(content)], { type: "application/json" })`.
     - **HTML**: Serializes formatted markup via `editor.getHTML()` into `new Blob([content], { type: "text/html" })`.
     - **Plain Text**: Extracts raw text via `editor.getText()` into `new Blob([content], { type: "text/plain" })`.
     - **PDF**: Dispatches `window.print()`, leveraging `@media print` CSS rules that isolate the editor canvas while hiding UI chrome.
3. **Table Insertion Grid (`insertTable`)**:
   - Preset table dimension actions ($1 \times 1$, $2 \times 2$, $3 \times 3$, $4 \times 4$) execute `@tiptap/extension-table` commands via `editor.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run()`.
4. **History & Formatting Shortcuts**:
   - History commands execute `editor.chain().focus().undo().run()` and `redo().run()` with standard platform shortcut badges (`⌘Z`, `⌘Y`).
   - Text mark toggles execute `toggleBold()`, `toggleItalic()`, `toggleUnderline()`, and `toggleStrike()` with shortcut badge `⌘⇧S` matching the `Mod-Shift-s` binding, alongside bulk mark clearance via `unsetAllMarks()`.
   - Unimplemented menu items (`New Document`, `Rename`, `Remove`) are explicitly marked `disabled` until corresponding actions/mutations exist.
5. **Menubar Styling & Token Conventions**:
   - Menubar triggers and items use semantic tokens (`hover:bg-muted`, `focus:bg-accent focus:text-accent-foreground`).
   - SVG icons inside Menubar items automatically scale to `size-4` via built-in item selector rules (`[&_svg:not([class*='size-'])]:size-4`).
