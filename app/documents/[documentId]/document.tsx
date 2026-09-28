"use client"

import { Preloaded, usePreloadedQuery } from "convex/react"

import { FullscreenLoader } from "@/components/fullscreen-loader"
import { api } from "@/convex/_generated/api"

import { DocumentEditor } from "./editor"
import { Navbar } from "./navbar"
import { ClientSideSuspense, Room } from "./room"
import { Toolbar } from "./toolbar"

interface DocumentProps {
  preloadedDocument: Preloaded<typeof api.documents.getById>
}

/**
 * Client component for document editing.
 * Consumes the preloaded document query and renders the collaborative room,
 * navigation bar, toolbar, and document editor.
 */
export function Document({ preloadedDocument }: DocumentProps) {
  const document = usePreloadedQuery(preloadedDocument)

  return (
    <Room key={document._id} roomId={document._id}>
      <div className="min-h-screen bg-muted/40 print:bg-white">
        <div className="fixed top-0 right-0 left-0 z-10 flex flex-col gap-y-2 bg-background px-4 pt-2 print:hidden">
          <Navbar data={document} />
          <Toolbar />
        </div>
        <div className="flex min-h-screen flex-col pt-28.5 print:pt-0">
          <ClientSideSuspense
            fallback={<FullscreenLoader label="Room loading…" />}
          >
            <DocumentEditor
              documentId={document._id}
              initialContent={document.initialContent}
            />
          </ClientSideSuspense>
        </div>
      </div>
    </Room>
  )
}
