# Tiptap Editor & Extensions Conventions

This document details the configuration, custom extensions, ProseMirror schema constraints, and page layout mechanics of the **Tiptap rich-text editor**.

---

## 1. Core Architecture & Tiptap Engine

The document editor is powered by Tiptap v3. It integrates with ProseMirror under the hood, running in a headless client component:

- **Editor Hook**: Initialized via `useEditor` from `@tiptap/react`.
- **Editor Store**: When instantiated, the active editor reference is registered in the global Zustand store (`store/use-editor-store.ts`) so toolbar controls can execute commands.
- **Content Persistence**: Content state is synchronized collaboratively with Liveblocks via `@liveblocks/react-tiptap`.

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

---

## 3. Custom Extension Pattern (`extensions/`)

Custom extensions are authored in `extensions/` by extending core Tiptap classes (`Extension` or `Mark`):

```typescript
// extensions/font-size.ts
import { Extension } from "@tiptap/core"
import "@tiptap/extension-text-style"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSizeExtension = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
```

---

## 4. Document Canvas, Ruler & Printable Margins

1. **Page Canvas Dimensions**:
   - The document canvas simulates a standard print page (816px width for standard 8.5in × 11in document at 96 DPI).
   - Wrapped in a responsive viewport with a minimum height (`min-h-[1056px]`) and drop shadow.
2. **Interactive Ruler (`ruler.tsx`)**:
   - Left and right margin markers emit drag coordinates to control document indentation.
   - Ruler values correspond directly to padding styles on the print container (e.g., `paddingLeft: ${leftMargin}px`).
3. **Print Support**:
   - Media queries (`@media print`) hide toolbars, rulers, and collaboration chrome, printing only the editor document body with clean pagination.

---

## 5. Toolbar Component Pattern

Toolbar controls should read state and execute chains against the active editor stored in `useEditorStore`:

```tsx
// components/toolbar/bold-button.tsx
"use client"

import { Bold } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/store/use-editor-store"

export function BoldButton() {
  const { editor } = useEditorStore()

  return (
    <Button
      aria-label="Toggle Bold"
      disabled={!editor}
      size="sm"
      variant={editor?.isActive("bold") ? "secondary" : "ghost"}
      onClick={() => editor?.chain().focus().toggleBold().run()}
    >
      <Bold className="size-4" />
    </Button>
  )
}
```
