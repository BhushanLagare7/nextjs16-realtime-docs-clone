# Home Dashboard, Search & Template Gallery

This document details the home route architecture, navigation bar, URL-synchronized search input, and template gallery carousel.

---

## 1. Route Layout & Page Shell (`app/(home)/page.tsx`)

The dashboard page uses Next.js Route Groups `(home)` to isolate home page layout concerns from document editing routes:

1. **Fixed Navigation Bar Container**:
   - `fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4` ensures a sticky top navigation bar using semantic tokens.
2. **Offset Content Container**:
   - `mt-16` provides the proper vertical spacing offset to prevent page content from being obscured beneath the fixed navbar.
3. **Reactive Paginated Documents Feed**:
   - Uses `usePaginatedQuery(api.documents.get, { search }, { initialNumItems: 5 })` from `convex/react` to feed real-time documents into `DocumentsTable`.

---

## 2. Navigation Bar & Search Input

### Home Navbar (`app/(home)/navbar.tsx`)

- **Branding**: Contains Scribe logo (`Image` with `height={36}` and `width={36}`) and brand title using `text-foreground`.
- **Suspense Boundary for Search**:
  - The client `<SearchInput />` component is wrapped in `<Suspense>` to prevent Next.js static prerender CSR bailouts triggered by URL parameter hooks.
- **Organization & User Profile**:
  - Embeds `<OrganizationSwitcher />` and `<UserButton />` from `@clerk/nextjs` for multi-tenant workspace context switching.
  - Redirect URLs (`afterCreateOrganizationUrl`, `afterLeaveOrganizationUrl`, `afterSelectOrganizationUrl`, `afterSelectPersonalUrl`) point to the dashboard root `/`.

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

## 3. Templates Gallery & Document Creation

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
4. **Creation State Locking & Mutation**:
   - Invokes `useMutation(api.documents.create)` on template click, passing `title` and `initialContent`.
   - On resolution, navigates to `/documents/${documentId}` via `useRouter()`.
   - Dims container (`pointer-events-none opacity-50`) and disables buttons while creation is in-flight (`isCreating`).

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

---

## 4. Documents Table & Rows

### Documents Table (`app/(home)/documents-table.tsx`)

1. **State Presentation**:
   - **Loading**: Displays centered `LoaderIcon` (`animate-spin text-muted-foreground`) while query resolves (`documents === undefined`).
   - **Empty**: Renders single full-width cell (`colSpan={4}`) stating `"No documents found"`.
   - **Populated**: Maps `Doc<"documents">` records to `<DocumentRow />` components.
2. **Reactive Pagination Controls**:
   - Includes `<Button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>` toggling `"Load more"` vs `"End of results"`.

### Document Row & Action Menu (`app/(home)/document-row.tsx`, `app/(home)/document-menu.tsx`)

1. **Icon & Title**: Renders Google Docs brand mark using `SiGoogledocs text-primary` and title.
2. **Workspace Scope**: Conditionally displays `Building2Icon` ("Organization") when `organizationId` is present, or `CircleUserIcon` ("Personal") when absent.
3. **Date Formatting**: Formats `_creationTime` using standard `Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" })`.
4. **Navigation & Event Isolation**: Clicking the row navigates to `/documents/${document._id}`.
5. **Document Actions Menu (`app/(home)/document-menu.tsx`)**:
   - Encapsulates actions in a `DropdownMenu` with trigger button (`MoreVertical`, `aria-label="More options"`).
   - **Rename**: Opens modal `<RenameDialog>` to edit the document's title via `api.documents.updateById`.
   - **Remove**: Opens confirmation `<RemoveDialog>` (using `<AlertDialog>`) to permanently delete via `api.documents.removeById`.
   - **Open in a new tab**: Opens the document route (`/documents/${documentId}`) in a separate browser tab.
   - Prevents click propagation (`e.stopPropagation()`) and premature menu dismissal (`e.preventDefault()` on select) for child dialogs.

---

## 5. Shared Mutation Dialog Components

### Architecture (`components/rename-dialog.tsx`, `components/remove-dialog.tsx`)

Reusable document-action dialogs live in `components/` (not route-specific) for cross-route reuse:

1. **Trigger-as-Child Pattern**: Accept `children: React.ReactNode` and use `<DialogTrigger asChild>` / `<AlertDialogTrigger asChild>` to wrap any element as the opener.
2. **Typed Document ID Prop**: Accept `documentId: Id<"documents">` from `@/convex/_generated/dataModel` for type-safe mutation calls.
3. **In-Flight State Locking**: Track mutation state (`isRemoving` / `isUpdating`) via local `useState` to disable action buttons during execution.
4. **Mutation Feedback & Error Handling**: Chain `.then()` → `.catch()` → `.finally()` on Convex `useMutation` calls to dispatch toast notifications via `sonner` (`toast.success(...)`, `toast.error(...)`) — never `await` inside onClick handlers.
5. **RenameDialog State Reset**: On `onOpenChange`, reset `title` to `initialTitle` when dialog reopens to prevent stale input.

### Dialog-inside-Dropdown Event Isolation

When a `<Dialog>` / `<AlertDialog>` is rendered as a child of a `<DropdownMenuItem>`, apply three event guards: `onClick={e.stopPropagation()}` on the trigger to prevent row navigation, `onSelect={e.preventDefault()}` on the item to prevent premature menu dismissal, and `onClick={e.stopPropagation()}` on `DialogContent` / `AlertDialogContent` to isolate all dialog interactions from parent handlers.
