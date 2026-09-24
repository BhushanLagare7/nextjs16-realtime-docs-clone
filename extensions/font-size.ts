import "@tiptap/extension-text-style"

import { Extension } from "@tiptap/core"

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
        (fontSize: string) =>
        ({ chain }) => {
          const match = fontSize.trim().match(/^(\d+)(?:px)?$/)
          if (!match) {
            return false
          }

          const numericSize = parseInt(match[1], 10)
          if (numericSize < MIN_FONT_SIZE || numericSize > MAX_FONT_SIZE) {
            return false
          }

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
