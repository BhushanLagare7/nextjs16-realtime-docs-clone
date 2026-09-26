import { useRef } from "react"
import { SiGoogledocs } from "react-icons/si"
import { useRouter } from "next/navigation"

import { Building2Icon, CircleUserIcon } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import type { Doc } from "@/convex/_generated/dataModel"

import { DocumentMenu } from "./document-menu"

interface DocumentRowProps {
  document: Doc<"documents">
}

/** Clickable table row representing a single document. */
export function DocumentRow({ document }: DocumentRowProps) {
  const router = useRouter()
  const rowRef = useRef<HTMLTableRowElement>(null)

  const onRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as Node
    if (!rowRef.current?.contains(target)) return
    router.push(`/documents/${document._id}`)
  }

  return (
    <TableRow ref={rowRef} className="cursor-pointer" onClick={onRowClick}>
      <TableCell className="w-12.5">
        <SiGoogledocs className="size-6 text-primary" />
      </TableCell>
      <TableCell className="font-medium md:w-[45%]">{document.title}</TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        <div className="flex items-center gap-2">
          {document.organizationId ? (
            <Building2Icon className="size-4" />
          ) : (
            <CircleUserIcon className="size-4" />
          )}
          {document.organizationId ? "Organization" : "Personal"}
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }).format(new Date(document._creationTime))}
      </TableCell>
      <TableCell className="flex justify-end">
        <DocumentMenu
          documentId={document._id}
          title={document.title}
          onNewTab={() => window.open(`/documents/${document._id}`, "_blank")}
        />
      </TableCell>
    </TableRow>
  )
}
