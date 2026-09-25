"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { templates } from "@/constants/templates"
import { cn } from "@/lib/utils"

export function TemplatesGallery() {
  const isCreating = false

  return (
    <div className="bg-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-4 px-16 py-6">
        <h3 className="font-medium text-foreground">Start a new document</h3>
        <Carousel>
          <CarouselContent className="-ml-4">
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
                    onClick={() => {}}
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
