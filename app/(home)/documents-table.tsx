import type { PaginationStatus } from "convex/react"
import { LoaderIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Doc } from "@/convex/_generated/dataModel"

import { DocumentRow } from "./document-row"

interface DocumentsTableProps {
  /** List of documents to display, or undefined while loading */
  documents: Doc<"documents">[] | undefined
  /** Callback to fetch more documents for pagination */
  loadMore: (numItems: number) => void
  /** Current pagination status (e.g. "CanLoadMore", "Exhausted") */
  status: PaginationStatus
}

/**
 * Displays a paginated table of documents, with loading and empty states.
 */
export function DocumentsTable({
  documents,
  loadMore,
  status,
}: DocumentsTableProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-y-5 px-16 py-6">
      {documents === undefined ? (
        // Loading state while documents are being fetched
        <div className="flex h-24 items-center justify-center">
          <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>&nbsp;</TableHead>
              <TableHead className="hidden md:table-cell">Shared</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
            </TableRow>
          </TableHeader>
          {documents.length === 0 ? (
            // Empty state when there are no documents
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={4}
                >
                  No documents found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            // Render one row per document
            <TableBody>
              {documents.map((document) => (
                <DocumentRow key={document._id} document={document} />
              ))}
            </TableBody>
          )}
        </Table>
      )}
      <div className="flex items-center justify-center">
        {/* Load more button, disabled when no more results are available */}
        <Button
          disabled={status !== "CanLoadMore"}
          size="sm"
          variant="ghost"
          onClick={() => loadMore(5)}
        >
          {status === "CanLoadMore" ? "Load more" : "End of results"}
        </Button>
      </div>
    </div>
  )
}
