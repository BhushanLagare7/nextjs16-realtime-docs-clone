# Document Chrome Theming & Component Checklist

This document details the theming standards for document chrome (ruler, toolbar, dropdowns, and swatches) along with the verification checklist for new components.

---

## 1. Document Chrome: Ruler, Toolbars & Menus

### Interactive Ruler (`ruler.tsx`)

The horizontal ruler must seamlessly integrate into both light and dark document canvases:

- **Ruler Track**: `bg-background` with bottom border `border-border`.
- **Ruler Ticks & Scale Numbers**: `text-[10px] text-muted-foreground/70`.
- **Margin Drag Markers (Left & Right)**: Marker SVGs use `fill-primary hover:fill-primary/80` for high visibility on the scale.

### Document Toolbar (`app/documents/[documentId]/toolbar.tsx`)

- **Toolbar Pill Container**: `min-h-10 flex items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden`.
- **Toolbar Buttons**:
  - Inactive: `text-foreground hover:bg-muted-foreground/15 focus-visible:outline-ring/50`.
  - Active: `bg-muted-foreground/20`.
  - Disabled: `disabled:opacity-40 disabled:pointer-events-none`.

### Dropdown Menus & Popovers (`components/ui/dropdown-menu.tsx`, `components/ui/popover.tsx`)

- **Surfaces & Text**: Styled with `bg-popover text-popover-foreground`.
- **Borders & Shadows**: Elevated with `ring-1 ring-foreground/10 shadow-lg` (or `shadow-md`).
- **Interactive Items**: Use `focus:bg-accent focus:text-accent-foreground` with selection indicators.

### Color & Highlight Picker Popover (`components/color-picker.tsx`)

- **Popover Container**: `w-60.5 p-2.5 bg-popover text-popover-foreground`.
- **Palette Swatches**: `size-4.5 rounded-full border border-border/40 hover:scale-125 focus-visible:outline-ring/50`. Selected swatch uses `ring-2 ring-primary ring-offset-1 ring-offset-popover`.
- **Reset Option**: Semantic button (`Default` / `None`) styled with `text-foreground hover:bg-muted focus-visible:outline-ring/50` and active state `bg-muted font-medium`.
- **Custom Spectrum Picker (`react-colorful` in `app/globals.css`)**: Scoped rules under `.custom-color-picker` conform third-party controls to theme radius tokens (`rounded-t-[calc(var(--radius)-2px)]`, `rounded-b-[calc(var(--radius)-2px)]`).

---

## 2. Summary Checklist for New Components

When building or updating UI components, verify:

- [ ] Uses semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`) rather than hardcoded hex, RGB, or raw color classes (`bg-white`, `border-[#C7C7C7]`).
- [ ] Zero manual `dark:` overrides on standard component surfaces.
- [ ] Interactive controls support focus rings via `outline-ring/50` or `ring-ring`.
- [ ] Printable areas enforce `print:bg-white print:text-black print:border-none print:shadow-none`.
- [ ] Non-text icon triggers provide accessible `aria-label` attributes.
- [ ] Passes `npm run format:check && npm run lint && npm run typecheck`.
