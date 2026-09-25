# Tiptap Headless Editor Theming & Cursors

This document details the dual-surface document layout and multiplayer presence cursor styling for the **Tiptap rich-text editor**.

---

## 1. Tiptap Headless Editor Theming

Tiptap is inherently **headless** — it ships without default styles or color opinions. All editor styling is driven by our CSS architecture.

### The Dual-Surface Document Layout

A document editor UI contains two distinct physical surfaces:

1. **The Workspace Viewport**: The scrollable area surrounding the document page.
2. **The Document Canvas ("Paper")**: The printable page sheet representing the 8.5in × 11in page (`816px` width at 96 DPI).

```tsx
// app/documents/[documentId]/editor.tsx
export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`,
        class: cn(
          "flex min-h-[1054px] w-[816px] cursor-text flex-col pt-10 pb-10 focus:outline-none",
          // Theming: Uses semantic card surface on screen, strictly white on print
          "border border-border bg-card text-card-foreground shadow-xs",
          "print:border-none print:bg-white print:p-0 print:text-black print:shadow-none"
        ),
      },
    },
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
  })

  return (
    // Workspace Viewport: bg-muted/40 adapts cleanly between light & dark
    <div className="size-full overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
```

---

## 2. Multiplayer Presence Cursors & Carets

In real-time multiplayer sessions (via Liveblocks / Y.js):

- **Collaborator Caret Flags**: Each collaborator is assigned a unique hue. Caret flags MUST display the collaborator's name pill with high-contrast text:
  ```css
  .collaboration-cursor__caret {
    border-left: 2px solid var(--cursor-color);
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
    position: relative;
    word-break: normal;
  }

  .collaboration-cursor__label {
    background-color: var(--cursor-color);
    border-radius: 3px;
    color: #ffffff; /* Explicit contrast against saturated cursor colors */
    font-size: 11px;
    font-weight: 600;
    left: -2px;
    line-height: normal;
    padding: 1px 4px;
    position: absolute;
    top: -1.4em;
    user-select: none;
    white-space: nowrap;
  }
  ```
