import { DocumentEditor } from "./editor"
import { Navbar } from "./navbar"
import { Room } from "./room"
import { Toolbar } from "./toolbar"

interface DocumentIdPageProps {
  /** Next.js dynamic route params, resolved asynchronously */
  params: Promise<{ documentId: string }>
}

/**
 * Page component for viewing/editing a single document.
 * Renders the top navigation bar, toolbar, and the document editor for the given documentId.
 */
export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 right-0 left-0 z-10 flex flex-col gap-y-2 bg-background px-4 pt-2 print:hidden">
        <Navbar />
        <Toolbar />
      </div>
      <div className="pt-28.5 print:pt-0">
        <Room roomId={documentId}>
          <DocumentEditor documentId={documentId} />
        </Room>
      </div>
    </div>
  )
}
