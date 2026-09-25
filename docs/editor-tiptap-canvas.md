# Document Canvas, Ruler & Printable Margins

This document details the document canvas dimensions, ruler alignment, margin tracking, and print media rules for the **Tiptap rich-text editor**.

---

## 1. Document Canvas, Ruler & Printable Margins

1. **Page Canvas Dimensions & Layout Structure**:
   - The document canvas simulates a standard print page (816px width for standard 8.5in × 11in document at 96 DPI, `min-h-[1054px]`).
   - **Outer Scroll Wrapper**: `size-full overflow-x-auto bg-muted/40 px-4 print:overflow-visible print:bg-white print:p-0`.
   - **Centering Container**: `mx-auto flex w-204 min-w-max justify-center py-4 print:w-full print:min-w-0 print:py-0`.
   - **Editor Element (`editorProps.attributes`)**: `focus:outline-none print:border-0 bg-card text-card-foreground border border-border shadow-xs flex flex-col min-h-[1054px] w-[816px] pt-10 pb-10 pl-[var(--page-margin-left,56px)] pr-[var(--page-margin-right,56px)] cursor-text print:bg-white print:text-black print:border-none print:p-0 print:shadow-none`, with left and right margins dynamically mapped via CSS variables (`style: "--page-margin-left: ${leftMargin}px; --page-margin-right: ${rightMargin}px;"`) so stylesheet print utilities can override padding to 0.
2. **Interactive Ruler (`ruler.tsx`)**:
   - The outer container is fixed to canvas width (`w-204 mx-auto` / 816px) with an inner `w-full h-full` relative container, guaranteeing that ruler tick marks, margin drag handles, and bottom borders strictly align with the centered 816px document canvas.
   - Left and right margin markers emit drag coordinates to update `leftMargin` and `rightMargin` in `useEditorStore` (or via optional controlled props), synchronously adjusting the editor's editing surface padding.
   - Markers use Pointer Events with pointer capture (`setPointerCapture(pointerId)`) on `pointerdown` and release on `pointerup`/`pointercancel`, ensuring active drags continue tracking smoothly even when the pointer moves outside ruler bounds.
   - Double-clicking either marker resets it to `DEFAULT_MARGIN` (56px) and restores standard editor padding.
3. **Print Support**:
   - Media queries (`@media print`) hide toolbars, rulers, and collaboration chrome, printing only the editor document body with clean pagination.
4. **Theming & Dark Mode**:
   - The document canvas adapts via semantic card tokens on-screen (`bg-card text-card-foreground border-border`) while print media strictly forces physical white paper (`print:bg-white print:text-black`). Detailed rules are documented in [`docs/theming-editor.md`](theming-editor.md).
5. **Task List & Nested List Typography (`app/globals.css`)**:
   - Task list selectors must strictly target direct children: `ul[data-type="taskList"] > li` (using child combinator `>`).
   - Never use descendant selector `ul[data-type="taskList"] li`, which matches standard ordered (`ol > li`) or unordered (`ul > li`) lists nested inside task items, stripping their bullet/number markers and inappropriately forcing task flex layout.
