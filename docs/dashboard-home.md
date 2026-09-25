# Home Dashboard, Search & Template Gallery

This document details the home route architecture, navigation bar, URL-synchronized search input, and template gallery carousel.

---

## 1. Route Layout & Page Shell (`app/(home)/page.tsx`)

The dashboard page uses Next.js Route Groups `(home)` to isolate home page layout concerns from document editing routes:

1. **Fixed Navigation Bar Container**:
   - `fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4` ensures a sticky top navigation bar using semantic tokens.
2. **Offset Content Container**:
   - `mt-16` provides the proper vertical spacing offset to prevent page content from being obscured beneath the fixed navbar.
3. **Server Component Shell**:
   - `page.tsx` remains a Server Component, embedding client leaf components (`TemplatesGallery`, `Navbar`).

---

## 2. Navigation Bar & Search Input

### Home Navbar (`app/(home)/navbar.tsx`)

- **Branding**: Contains Scribe logo (`Image` with `height={36}` and `width={36}`) and brand title using `text-foreground`.
- **Suspense Boundary for Search**:
  - The client `<SearchInput />` component is wrapped in `<Suspense>` to prevent Next.js static prerender CSR bailouts triggered by URL parameter hooks.

### Search Input Pattern (`app/(home)/search-input.tsx`)

- **URL State Coordination (`hooks/use-search-param.ts`)**:
  - Encapsulates `useQueryState("search", parseAsString.withDefault("").withOptions({ clearOnDefault: true }))` using `nuqs`.
- **Controlled Typing vs. URL Sync**:
  - Uses local `useState(search)` while typing (`onChange`) to avoid unnecessary history churn or query re-executions on every keystroke.
  - Syncs to URL state only on explicit form submission (`onSubmit`) or clear button click (`onClick`).
- **Focus Blur on Action**:
  - Calls `inputRef.current?.blur()` upon submitting or clearing search to dismiss keyboard focus.
- **Accessible Controls**:
  - Floating `Search` icon button (`type="submit"`) on the left and conditional `Clear` button (`XIcon`, `type="button"`) on the right, each with explicit `aria-label`.

---

## 3. Templates Gallery & Carousel

### Template Gallery (`app/(home)/templates-gallery.tsx`)

1. **Carousel Integration (`components/ui/carousel.tsx`)**:
   - Built on `embla-carousel-react` with accessible `CarouselPrevious` and `CarouselNext` arrow controls.
2. **Responsive Slide Basis**:
   - Item widths adjust across viewport breakpoints:
     `basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.285714%]`.
3. **Card Presentation**:
   - Uses `aspect-3/4` ratio for Google Docs style vertical document previews.
   - Background preview set via `style={{ backgroundImage: 'url(...)' }}` with `bg-cover bg-center bg-no-repeat`.
   - Card border uses `border-border` with hover transition `hover:border-primary hover:bg-primary/5`.
4. **Creation State Locking**:
   - When a template creation mutation is in-flight (`isCreating`), container disables pointer events and dims opacity (`pointer-events-none opacity-50`).

### Centralized Template Catalog (`constants/templates.ts`)

- Predefined document templates adhere to the `Template` type contract:
  ```typescript
  export interface Template {
    id: string
    imageUrl: string
    label: string
  }
  ```
- Vector illustrations are stored in `public/*.svg` and styled using dual-mode tokens.
