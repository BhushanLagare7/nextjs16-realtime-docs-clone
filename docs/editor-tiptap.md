# Tiptap Editor & Extensions Conventions

This document details the configuration, custom extensions, ProseMirror schema constraints, and page layout mechanics of the **Tiptap rich-text editor**.

---

## 1. Core Architecture & Tiptap Engine

The document editor is powered by Tiptap v3. It integrates with ProseMirror under the hood, running in a headless client component:

- **Editor Hook**: Initialized via `useEditor` from `@tiptap/react`. Always set `immediatelyRender: false` in Next.js App Router to avoid React 19 SSR hydration mismatch warnings.
- **Canonical Component & Exports**: The core document editor component is named `DocumentEditor` located at `app/documents/[documentId]/editor.tsx` and accepts `DocumentEditorProps` (`{ documentId?: string }`). An alias export `export { DocumentEditor as Editor }` is provided for backwards compatibility.
- **Editor Store**: When instantiated, the active editor reference is registered in the global Zustand store (`store/use-editor-store.ts`) via `useEditor` lifecycle callbacks (`onCreate`, `onDestroy`, `onUpdate`, `onSelectionUpdate`, `onTransaction`, `onFocus`, `onBlur`, `onContentError`) so toolbar controls can execute commands and react to editor state changes.
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
// Provides TypeScript command chaining augmentation only; TextStyle must also be
// explicitly registered in the editor's extensions array (or via TextStyleKit).
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

1. **Page Canvas Dimensions & Layout Structure**:
   - The document canvas simulates a standard print page (816px width for standard 8.5in × 11in document at 96 DPI, `min-h-[1054px]`).
   - **Outer Scroll Wrapper**: `size-full overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0`.
   - **Centering Container**: `mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0`.
   - **Editor Element (`editorProps.attributes`)**: `focus:outline-none print:border-0 bg-card text-card-foreground border border-border shadow-xs flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text print:bg-white print:text-black print:border-none print:shadow-none`, with left and right margins dynamically mapped to padding.
2. **Interactive Ruler (`ruler.tsx`)**:
   - Left and right margin markers emit drag coordinates to control document indentation.
   - Ruler values correspond directly to padding styles on the print container (e.g., `paddingLeft: ${leftMargin}px`).
3. **Print Support**:
   - Media queries (`@media print`) hide toolbars, rulers, and collaboration chrome, printing only the editor document body with clean pagination.
4. **Theming & Dark Mode**:
   - The document canvas adapts via semantic card tokens on-screen (`bg-card text-card-foreground border-border`) while print media strictly forces physical white paper (`print:bg-white print:text-black`). Detailed rules are documented in [`docs/theming.md`](theming.md).

---

## 5. Toolbar Component Pattern

The document toolbar (`app/documents/[documentId]/toolbar.tsx`) reads state and executes commands against the active editor stored in `useEditorStore`. Controls are organized into grouped multi-dimensional sections (`sections: { label, icon, onClick, isActive? }[][]`) rendered as compact, accessible buttons inside a semantic pill container (`min-h-10 flex items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden`):

```tsx
// app/documents/[documentId]/toolbar.tsx
"use client"

import { type LucideIcon, Undo2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

interface ToolbarButtonProps {
  onClick?: () => void
  isActive?: boolean
  icon: LucideIcon
  "aria-label"?: string
}

function ToolbarButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isActive,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-sm text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
        isActive && "bg-muted-foreground/20"
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )
}

export function Toolbar() {
  const { editor } = useEditorStore()

  const sections: {
    label: string
    icon: LucideIcon
    onClick: () => void
    isActive?: boolean
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
    ],
  ]

  return (
    <div className="flex min-h-10 items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden">
      {sections[0].map((item) => (
        <ToolbarButton
          key={item.label}
          aria-label={item.label}
          icon={item.icon}
          isActive={item.isActive}
          onClick={item.onClick}
        />
      ))}
    </div>
  )
}
```
