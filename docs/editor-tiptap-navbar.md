# Document Navbar & Menubar Actions

This document details the navigation bar, title editing, menubar actions, and file export operations for the **Real-Time Collaborative Document Editor**.

---

## 1. Document Navbar & Menubar Actions (`navbar.tsx`)

The document navigation bar (`app/documents/[documentId]/navbar.tsx`) sits above the toolbar and coordinates document title editing (`DocumentInput`) and application-level operations via modular menubar subcomponents (`FileMenu`, `EditMenu`, `InsertMenu`, `FormatMenu` in `app/documents/[documentId]/navbar/`):

1. **Global Editor Instance Access**:
   - Reads `editor` from `useEditorStore` to execute top-level document mutations, serialization, and history operations.
2. **Document Export Operations (`lib/document-export.ts`)**:
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
   - Menu actions (`New Document`, `Rename`, `Remove`) connect to backend mutations and modal dialogs: `New Document` invokes `api.documents.create` and redirects to `/documents/${id}`; `Rename` and `Remove` open accessible modal dialogs (`RenameDialog` and `RemoveDialog`) using `onSelect={(e) => e.preventDefault()}` and `onClick={(e) => e.stopPropagation()}` to prevent premature menubar closure.
5. **Menubar Styling & Token Conventions**:
   - Menubar triggers and items use semantic tokens (`hover:bg-muted`, `focus:bg-accent focus:text-accent-foreground`).
   - SVG icons inside Menubar items automatically scale to `size-4` via built-in item selector rules (`[&_svg:not([class*='size-'])]:size-4`).
6. **Collaborator Avatars, Notifications & Multi-Tenant Controls**:
   - Houses `<Avatars />` (active collaborator avatar stack with tooltips), `<Inbox />` (Liveblocks notification popover with unread count badge), `<OrganizationSwitcher />`, and `<UserButton />` from `@clerk/nextjs` in a right-aligned flex group (`flex items-center gap-3 pl-6`) allowing users to monitor presence, review unread notifications, and switch organizations or personal workspace context from within an active document.

---

## 2. Document Title Editing & Sync Status (`document-input.tsx`)

The document title input (`app/documents/[documentId]/document-input.tsx`) enables inline rename operations with live status indication:

1. **Auto-Expanding Input**: Uses an invisible sizing `<span>` with `whitespace-pre` positioned beneath an `absolute inset-0` transparent input to dynamically match input width to content length (up to `50ch`).
2. **Debounced Auto-Save & Submission Coordination (`useDebounce`)**: Typing triggers debounced mutations to `api.documents.updateById` via `useDebounce((newValue) => mutate({ id, title: newValue }), 500)`. Both input blur (`handleBlur`) and form submission (`handleSubmit`) flush pending debounced updates (`flush()`) before leaving edit mode, preventing duplicate mutations across blur and submission transitions.
3. **Multi-State Connection & Sync Indicators**:
   - **Saving / Connecting**: Displays `<LoaderIcon className="animate-spin" />` while mutation is pending or Liveblocks status is `connecting` / `reconnecting`.
   - **Disconnected**: Displays `<BsCloudSlash />` when Liveblocks room connection is offline.
   - **Saved & Synced**: Displays `<BsCloudCheck />` when changes are saved and the room is connected.
