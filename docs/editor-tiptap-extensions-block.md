# Tiptap Custom Block Extension Pattern

This document details the authoring of custom block-level attribute extensions (`extensions/line-height.ts`) for the **Tiptap rich-text editor**.

---

## 1. Custom Block-Level Extension Pattern (`extensions/line-height.ts`)

Block attributes must target block nodes (`paragraph`, `heading`) and use `tr.setNodeMarkup` to modify node attributes without corrupting inline text marks:

```typescript
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
