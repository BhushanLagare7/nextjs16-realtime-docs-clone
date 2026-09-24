# Tiptap Editor & Extensions Conventions

This document details the configuration, custom extensions, ProseMirror schema constraints, and page layout mechanics of the **Tiptap rich-text editor**.

---

## 1. Core Architecture & Tiptap Engine

The document editor is powered by Tiptap v3. It integrates with ProseMirror under the hood, running in a headless client component:

- **Editor Hook**: Initialized via `useEditor` from `@tiptap/react`. Always set `immediatelyRender: false` in Next.js App Router to avoid React 19 SSR hydration mismatch warnings.
- **Canonical Component & Exports**: The core document editor component is named `DocumentEditor` located at `app/documents/[documentId]/editor.tsx` and accepts `DocumentEditorProps` (`{ documentId?: string }`). An alias export `export { DocumentEditor as Editor }` is provided for backwards compatibility.
- **Editor Store**: When instantiated, the active editor reference is registered in the global Zustand store (`store/use-editor-store.ts`) via `useEditor` lifecycle callbacks (`onCreate`, `onDestroy`, `onUpdate`, `onSelectionUpdate`, `onTransaction`, `onFocus`, `onBlur`, `onContentError`) so toolbar controls can execute commands and react to editor state changes.
- **Core Extensions Configuration**: Standard editor extensions include `StarterKit` (which bundles `Underline`, `Bold`, `Italic`, `Strike`, `BulletList`, `OrderedList`, etc. by default in Tiptap v3), `TextAlign.configure({ types: ["heading", "paragraph"] })`, `FontFamily`, `TextStyle`, `Color`, `Highlight.configure({ multicolor: true })`, `Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" })`, `Image.configure({ resize: { enabled: true } })`, `Table.configure({ resizable: true })`, `TableCell`, `TableHeader`, `TableRow`, `TaskItem.configure({ nested: true })`, `TaskList`, and custom extensions `FontSizeExtension` and `LineHeightExtension`. Do not register standalone `Underline` alongside default `StarterKit` to avoid duplicate extension warnings.
- **Native Image Resizing (Tiptap v3)**: Tiptap v3 incorporates resizable node views directly in `@tiptap/extension-image` via `Image.configure({ resize: { enabled: true } })`. Never register third-party extensions (e.g. `tiptap-extension-resize-image`) alongside `@tiptap/extension-image`, as duplicate node definitions cause editor warnings and inconsistent image parsing.
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

// extensions/line-height.ts (Block-Level Attribute Extension Pattern)
// Block attributes must target block nodes ('paragraph', 'heading') and use tr.setNodeMarkup:
export const LineHeightExtension = Extension.create<LineHeightOptions>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultLineHeight: "normal",
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) =>
              element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ dispatch, state, tr }) => {
          let hasUpdated = false
          tr = tr.setSelection(state.selection)

          state.doc.nodesBetween(
            state.selection.from,
            state.selection.to,
            (node, pos) => {
              if (this.options.types.includes(node.type.name)) {
                hasUpdated = true
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight,
                })
              }
            }
          )

          if (hasUpdated && dispatch) dispatch(tr)
          return hasUpdated
        },
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
5. **Task List & Nested List Typography (`app/globals.css`)**:
   - Task list selectors must strictly target direct children: `ul[data-type="taskList"] > li` (using child combinator `>`).
   - Never use descendant selector `ul[data-type="taskList"] li`, which matches standard ordered (`ol > li`) or unordered (`ul > li`) lists nested inside task items, stripping their bullet/number markers and inappropriately forcing task flex layout.

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

### 5.1 Toolbar Dropdown Selectors Pattern

Dropdown selectors in the toolbar (e.g. `FontFamilyButton`, `HeadingLevelButton`) adhere to strict sizing and layout standards:

1. **Trigger Anti-Jitter Layout**:
   - Always define explicit fixed widths (e.g., `w-30`) with `justify-between` and `overflow-hidden` for text dropdown triggers (`FontFamilyButton`, `HeadingLevelButton`).
   - Never use dynamic widths (`min-w-7 justify-center`), as changing active options (e.g., `"Normal text"` vs `"Heading 1"`) causes layout shifts (jitter) across subsequent toolbar controls.
2. **Popover Content Width & Single-Line Text**:
   - `components/ui/dropdown-menu.tsx` defaults to `w-(--radix-dropdown-menu-trigger-width) min-w-32`. On triggers narrower than option labels, this forces multi-word options (e.g., `"Times New Roman"`, `"Paste image URL"`) to wrap across lines.
   - Always override on `<DropdownMenuContent>` with `w-auto min-w-48 flex-col gap-y-1 p-1` and add `whitespace-nowrap` to option labels to guarantee single-line rendering across all dropdown selectors (`FontFamilyButton`, `HeadingLevelButton`, `ImageButton`).
3. **Tiptap v3 Named Imports**:
   - Tiptap v3 packages `@tiptap/extension-text-style`, `@tiptap/extension-font-family`, `@tiptap/extension-color`, `@tiptap/extension-highlight`, and `@tiptap/extension-text-align` expose named exports (`import { TextStyle }`, `import { FontFamily }`, `import { Color }`, `import { Highlight }`, `import { TextAlign }`). Never use default imports.
4. **Color & Highlight Picker Popovers**:
   - `TextColorButton` and `HighlightColorButton` render the custom `ColorPicker` popover (`components/color-picker.tsx`), powered by Radix UI `Popover` and `react-colorful`.
   - Displays a standard 80-color Google Docs swatch matrix, a theme-aware reset option (`Default` / `unsetColor()` for text; `None` / `unsetHighlight()` for highlight), and a collapsible custom spectrum picker with hex input.
   - Text color updates via `editor.chain().focus().setColor(color).run()` on the `textStyle` mark.
   - Highlight color updates via `editor.chain().focus().setHighlight({ color }).run()` on the `highlight` mark.
   - Buttons provide explicit `aria-label` attributes (`"Text color"`, `"Highlight color"`) and adhere to semantic tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`).
5. **Heading Level Idempotency**:
   - In heading dropdown selectors, always execute `editor.chain().focus().setHeading({ level }).run()` instead of `toggleHeading({ level })`. Selecting an already-active level in a selection menu must keep the block at that heading level instead of reverting it back to a normal paragraph.
6. **Local Draft State for Custom Pickers**:
   - Custom spectrum pickers (`HexColorPicker` and `HexColorInput`) inside popovers must bind to a local draft state (`draftColor`) initialized from `safeCustomColor` on `onOpenChange`.
   - Edits are committed only via an explicit user action (e.g., an "Apply" button invoking `handleSwatchSelect(draftColor)`), preventing unwanted editor transactions and state churn while dragging the spectrum picker or typing incomplete hex values.
7. **Link & Image Insert Controls**:
   - `LinkButton` renders a standardized popover (`w-80 p-2.5`) with a full `flex-1` `Input` and `Apply` button, allowing users to comfortably enter or edit full target URLs (with `https` default) without cramping or truncation. Key events inside the input stop propagation to avoid closing or triggering dropdown navigation on space or enter. Submitting updates hyperlinks via `editor.chain().focus().extendMarkRange("link").setLink({ href }).run()` or `unsetLink()` and automatically dismisses the popover.
   - `ImageButton` provides a standardized dropdown menu (`min-w-48 flex-col gap-y-1 p-1`) with single-line labels (`whitespace-nowrap`) supporting both local file upload (via dynamic file input generating object URLs) and remote image URL entry via an accessible modal Dialog (`sm:max-w-md` `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Input`, `Button`) executing `editor.chain().focus().setImage({ src }).run()`.
   - Both controls adhere strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Insert link"`, `"Insert image"`).
8. **Alignment & List Dropdown Controls**:
   - `AlignButton` provides text alignment options (`left`, `center`, `right`, `justify`) targeting block nodes via `editor.chain().focus().setTextAlign(value).run()`, rendering options inside a standard dropdown menu (`w-auto min-w-48 flex-col gap-y-1 p-1`) using `<DropdownMenuItem>`.
   - `ListButton` provides list toggle options (`bulletList` via `toggleBulletList()`, `orderedList` via `toggleOrderedList()`), rendering options inside a standard dropdown menu and applying active token highlights (`bg-muted-foreground/20`) on active list states.
   - Both controls adhere strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Text alignment"`, `"List options"`).
9. **Font Size Stepper & Direct Input Controls**:
   - `FontSizeButton` renders decrement (`-`) and increment (`+`) icon buttons around an editable numeric trigger displaying the active font size (defaulting to `"16"`).
   - Clicking the trigger enters inline edit mode (`<input type="text">`), committing updates on blur or Enter via `editor.chain().focus().setFontSize(`${size}px`).run()` and resetting on invalid or non-numeric input.
   - All controls adhere strictly to semantic styling tokens (`border-input text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Decrease font size"`, `"Font size"`, `"Increase font size"`).
10. **Line Spacing Dropdown Controls**:
    - `LineHeightButton` provides line spacing options (`Default` / `normal`, `Single` / `1`, `1.15`, `1.5`, `Double` / `2`) targeting block nodes (`paragraph`, `heading`) via custom `LineHeightExtension` and `editor.chain().focus().setLineHeight(value).run()`.
    - Renders options inside a standard dropdown menu (`w-auto min-w-48 flex-col gap-y-1 p-1`) using `<DropdownMenuItem>` with single-line labels (`whitespace-nowrap`).
    - Detects active line height via `editor.getAttributes("paragraph").lineHeight` or `editor.getAttributes("heading").lineHeight` (defaulting to `"normal"`), applying active token highlights (`bg-muted-foreground/20`).
    - Adheres strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provides an accessible `aria-label="Line spacing"`.
