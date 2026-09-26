"use client"

import { usePaginatedQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { useSearchParam } from "@/hooks/use-search-param"

import { DocumentsTable } from "./documents-table"
import { Navbar } from "./navbar"
import { TemplatesGallery } from "./templates-gallery"

/**
 * Home page: displays the navbar, templates gallery, and a paginated
 * list of the current user's documents.
 */
export default function Home() {
  const [search] = useSearchParam()
  // Fetch documents in pages of 5, loading more as requested
  const { loadMore, results, status } = usePaginatedQuery(
    api.documents.get,
    { search },
    { initialNumItems: 5 }
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
        <DocumentsTable
          documents={results}
          loadMore={loadMore}
          status={status}
        />
      </div>
    </div>
  )
}
