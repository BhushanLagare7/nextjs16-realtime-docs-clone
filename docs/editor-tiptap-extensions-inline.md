# Tiptap Custom Inline Extension Pattern

This document details the authoring of custom inline mark and style extensions (`extensions/font-size.ts`) for the **Tiptap rich-text editor**.

---

## 1. Custom Inline Extension Pattern (`extensions/font-size.ts`)

Custom inline style extensions extend core Tiptap classes (`Extension` or `Mark`) targeting inline marks (`textStyle`):

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

export const MIN_FONT_SIZE = 1
export const MAX_FONT_SIZE = 100

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
        ({ chain }) => {
          const match = fontSize.trim().match(/^(\d+)(?:px)?$/)
          if (!match) return false
          const numericSize = parseInt(match[1], 10)
          if (numericSize < MIN_FONT_SIZE || numericSize > MAX_FONT_SIZE)
            return false
          return chain()
            .setMark("textStyle", { fontSize: `${numericSize}px` })
            .run()
        },
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
