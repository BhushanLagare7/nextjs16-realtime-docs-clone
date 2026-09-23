import { DocumentEditor } from "./editor"
import { Toolbar } from "./toolbar"

interface DocumentIdPageProps {
  params: Promise<{ documentId: string }>
}

export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar />
      <DocumentEditor documentId={documentId} />
    </div>
  )
}
