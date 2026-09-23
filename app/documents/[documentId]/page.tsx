import { DocumentEditor } from "./editor"

interface DocumentIdPageProps {
  params: Promise<{ documentId: string }>
}

export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params

  return (
    <div className="min-h-screen bg-muted/40">
      <DocumentEditor documentId={documentId} />
    </div>
  )
}
