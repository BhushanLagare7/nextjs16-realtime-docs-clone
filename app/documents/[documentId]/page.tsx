import { DocumentEditor } from "./editor"
import { Toolbar } from "./toolbar"

interface DocumentIdPageProps {
  /** Next.js dynamic route params, resolved asynchronously */
  params: Promise<{ documentId: string }>
}

/**
 * Page component for viewing/editing a single document.
 * Renders the toolbar and the document editor for the given documentId.
 */
export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar />
      <DocumentEditor documentId={documentId} />
    </div>
  )
}
