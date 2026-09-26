# Tiptap Toolbar Dropdown Selectors & Controls

This document details the dropdown menus, popovers, pickers, and interactive controls used in the **Tiptap document toolbar**.

---

## 1. Toolbar Dropdown Selectors Pattern

Dropdown selectors in the toolbar (e.g. `FontFamilyButton`, `HeadingLevelButton`) adhere to strict sizing and layout standards:

1. **Trigger Anti-Jitter Layout**:
   - Always define explicit fixed widths (e.g., `w-30`) with `justify-between` and `overflow-hidden` for text dropdown triggers (`FontFamilyButton`, `HeadingLevelButton`).
   - Never use dynamic widths (`min-w-7 justify-center`), as changing active options (e.g., `"Normal text"` vs `"Heading 1"`) causes layout shifts (jitter) across subsequent toolbar controls.
2. **Popover Content Width & Single-Line Text**:
   - `components/ui/dropdown-menu.tsx` defaults to `min-w-32`. To ensure comfortable menu width and prevent multi-word options (e.g., `"Times New Roman"`, `"Paste image URL"`) from wrapping, always set `w-auto min-w-48 flex-col gap-y-1 p-1` on `<DropdownMenuContent>` and add `whitespace-nowrap` to option labels across all dropdown selectors (`FontFamilyButton`, `HeadingLevelButton`, `ImageButton`).
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
   - `LinkButton` renders a standardized popover (`w-80 p-2.5`) with a full `flex-1` `Input` and `Apply` button, allowing users to comfortably enter or edit full target URLs without cramping or truncation. Key events inside the input stop propagation to avoid closing or triggering dropdown navigation on space or enter. Submitting normalizes the entered `href` by trimming whitespace, preserving explicit protocols (`/^[a-zA-Z][a-zA-Z0-9+.-]*:/`) and relative URLs (`/`, `#`, `.`, `?`, `//`), prepending `https://` to bare domains, and applying updates via `editor.chain().focus().extendMarkRange("link").setLink({ href: normalizedHref }).run()` or `unsetLink()` (when empty) before dismissing the popover.
   - `ImageButton` provides a standardized dropdown menu (`min-w-48 flex-col gap-y-1 p-1`) with single-line labels (`whitespace-nowrap`) supporting both local file upload (via dynamic file input generating object URLs) and remote image URL entry via an accessible modal Dialog (`sm:max-w-md` `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Input`, `Button`) executing `editor.chain().focus().setImage({ src }).run()`. Because the Dialog is driven programmatically without a `<DialogTrigger>`, `DialogContent` implements `onCloseAutoFocus={(e) => { e.preventDefault(); imageButtonRef.current?.focus() }}` to return focus cleanly to the persistent Insert image toolbar button upon dismissal.
   - Both controls adhere strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Insert link"`, `"Insert image"`).
8. **Alignment & List Dropdown Controls**:
   - `AlignButton` provides text alignment options (`left`, `center`, `right`, `justify`) targeting block nodes via `editor.chain().focus().setTextAlign(value).run()`, rendering options inside a standard dropdown menu (`w-auto min-w-48 flex-col gap-y-1 p-1`) using `<DropdownMenuItem>`.
   - `ListButton` provides list toggle options (`bulletList` via `toggleBulletList()`, `orderedList` via `toggleOrderedList()`), rendering options inside a standard dropdown menu and applying active token highlights (`bg-muted-foreground/20`) on active list states.
   - Both controls adhere strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Text alignment"`, `"List options"`).
9. **Font Size Stepper & Direct Input Controls**:
   - `FontSizeButton` renders decrement (`-`) and increment (`+`) icon buttons around an editable numeric trigger displaying the active font size (defaulting to `"16"`).
   - Clicking the trigger enters inline edit mode (`<input type="text">`), committing updates on blur or Enter via `editor.chain().focus().setFontSize(`${size}px`).run()` and resetting on invalid, partial, or decimal input.
   - Enforces defined minimum and maximum bounds (`MIN_FONT_SIZE = 1`, `MAX_FONT_SIZE = 100`) consistently across toolbar stepper/input validation and the underlying `setFontSize` extension command (`extensions/font-size.ts`).
   - All controls adhere strictly to semantic styling tokens (`border-input text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provide accessible `aria-label` attributes (`"Decrease font size"`, `"Font size"`, `"Increase font size"`).
10. **Line Spacing Dropdown Controls**:
    - `LineHeightButton` provides line spacing options (`Default` / `normal`, `Single` / `1`, `1.15`, `1.5`, `Double` / `2`) targeting block nodes (`paragraph`, `heading`) via custom `LineHeightExtension` and `editor.chain().focus().setLineHeight(value).run()`.
    - Renders options inside a standard dropdown menu (`w-auto min-w-48 flex-col gap-y-1 p-1`) using `<DropdownMenuItem>` with single-line labels (`whitespace-nowrap`).
    - Detects active line height via `editor.getAttributes("paragraph").lineHeight` or `editor.getAttributes("heading").lineHeight` (defaulting to `"normal"`), applying active token highlights (`bg-muted-foreground/20`).
    - Adheres strictly to semantic styling tokens (`text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`) and provides an accessible `aria-label="Line spacing"`.
