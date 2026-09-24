import { Extension } from "@tiptap/core"

export interface LineHeightOptions {
  types: string[]
  defaultLineHeight: string
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set the line height attribute on block nodes.
       * @param lineHeight The line height value (e.g. 'normal', '1', '1.15', '1.5', '2')
       * @example editor.commands.setLineHeight('1.5')
       */
      setLineHeight: (lineHeight: string) => ReturnType
      /**
       * Unset the line height attribute on block nodes, restoring default line height.
       * @example editor.commands.unsetLineHeight()
       */
      unsetLineHeight: () => ReturnType
    }
  }
}

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
            parseHTML: (element) => {
              return element.style.lineHeight || this.options.defaultLineHeight
            },
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {}
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              }
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
          const { selection } = state
          let hasUpdated = false

          tr = tr.setSelection(selection)

          const { from, to } = selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              hasUpdated = true
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight,
              })
            }
          })

          if (hasUpdated && dispatch) {
            dispatch(tr)
          }

          return hasUpdated
        },

      unsetLineHeight:
        () =>
        ({ dispatch, state, tr }) => {
          const { selection } = state
          let hasUpdated = false

          tr = tr.setSelection(selection)

          const { from, to } = selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              hasUpdated = true
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight: this.options.defaultLineHeight,
              })
            }
          })

          if (hasUpdated && dispatch) {
            dispatch(tr)
          }

          return hasUpdated
        },
    }
  },
})
