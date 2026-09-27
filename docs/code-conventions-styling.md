# Tailwind CSS v4 & Accessibility Conventions

This document establishes the styling standards, Tailwind CSS v4 class merging rules, zero hardcoded colors policy, and accessibility guidelines.

---

## 1. Tailwind CSS v4 & ClassName Merging

1. **Always use the `cn()` utility**:
   - Combine class names conditionally using `cn()` from `@/lib/utils` (powered by `clsx` and `tailwind-merge`).
   - ```tsx
     import { cn } from "@/lib/utils"

     export function StatusBadge({ active, className }: StatusBadgeProps) {
       return (
         <span
           className={cn(
             "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
             active
               ? "bg-primary/10 text-primary"
               : "bg-muted text-muted-foreground",
             className
           )}
         >
           {active ? "Live" : "Draft"}
         </span>
       )
     }
     ```
2. **Component Variants with CVA**:
   - For components with multiple variants or sizes, use `class-variance-authority` (`cva`).
3. **No Arbitrary Inline Styles**:
   - Never use `style={{ color: "red" }}`. Use Tailwind utility classes.
   - Inline styles are permitted **only** for dynamically calculated coordinates or measurements (e.g. ruler positioning, drag-and-drop handles, custom margins in pixels) or dynamic asset background images (`style={{ backgroundImage: `url(${imageUrl})` }}`).
4. **Zero Hardcoded Colors Policy**:
   - Never use hardcoded hex values (e.g., `#FAFBFD`, `#C7C7C7`, `#ffffff`), RGB/HSL, or raw Tailwind color utility classes (e.g., `bg-white`, `text-black`, `text-blue-500`, `dark:bg-zinc-900`).
   - All styling must strictly utilize established semantic tokens or theme CSS variables (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-secondary`, etc.).
   - **Exceptions**:
     - Collaborator cursor labels (`.collaboration-carets__label`) may use fixed white text (`#ffffff`) for contrast against saturated collaborator colors.
     - Document canvas print styles may use `print:bg-white` and `print:text-black` to guarantee standard physical paper output regardless of the active screen theme.
     - User-authored document text/highlight marks and color picker palette matrices (`GOOGLE_DOCS_PALETTE`) representing arbitrary user content or input values (not UI component chrome or layout surfaces).
   - Full theming architecture and token pairing rules are documented in [`docs/theming-tokens.md`](theming-tokens.md).
5. **Tailwind v4 Sizing Utilities & Pseudo-Class Variants**:
   - Prefer Tailwind v4 fractional sizing utilities (`w-12.5` for 50px) over arbitrary bracket notations (`w-[50px]`).
   - Prefer standard Tailwind v4 pseudo-class variants (e.g. `has-[[role=checkbox]]:pr-0`) over legacy arbitrary selector nesting (`[&:has([role=checkbox])]:pr-0`).

---

## 2. Accessibility (a11y) Standards

- **Icon Buttons**: All interactive elements lacking visible text (such as toolbar buttons) MUST include an descriptive `aria-label`:
  ```tsx
  <Button aria-label="Toggle Bold" size="icon" variant="ghost">
    <Bold className="size-4" />
  </Button>
  ```
- **Keyboard Navigation**: Ensure custom dropdowns, popovers, and dialogs remain accessible via Tab, Escape, and Enter keys.
- **Color Contrast**: Respect dark and light theme tokens configured in `app/globals.css`.
