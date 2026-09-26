"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { useMutation } from "convex/react"
import { toast } from "sonner"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { templates } from "@/constants/templates"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

/**
 * Renders a horizontally scrollable gallery of document templates.
 * Clicking a template creates a new document and navigates to it.
 */
export function TemplatesGallery() {
  const router = useRouter()
  const create = useMutation(api.documents.create)
  // Tracks whether a document is currently being created (disables interactions)
  const [isCreating, setIsCreating] = useState(false)

  // Creates a new document from the selected template and navigates to it
  const onTemplateClick = (title: string, initialContent: string) => {
    setIsCreating(true)
    create({ title, initialContent })
      .then((documentId) => {
        toast.success("Document created")
        router.push(`/documents/${documentId}`)
      })
      .catch(() => {
        toast.error("Something went wrong")
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  return (
    <div className="bg-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-4 px-16 py-6">
        <h3 className="font-medium text-foreground">Start a new document</h3>
        <Carousel>
          <CarouselContent className="-ml-4">
            {/* Render one card per available template */}
            {templates.map((template) => (
              <CarouselItem
                key={template.id}
                className="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.285714%]"
              >
                <div
                  className={cn(
                    "flex aspect-3/4 flex-col gap-y-2.5",
                    isCreating && "pointer-events-none opacity-50"
                  )}
                >
                  <button
                    aria-label={template.label}
                    className="flex size-full flex-col items-center justify-center gap-y-4 rounded-sm border border-border bg-card bg-cover bg-center bg-no-repeat transition hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    disabled={isCreating}
                    style={{
                      backgroundImage: `url(${template.imageUrl})`,
                    }}
                    type="button"
                    onClick={() => onTemplateClick(template.label, "")}
                  />
                  <p className="truncate text-sm font-medium text-foreground">
                    {template.label}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}
