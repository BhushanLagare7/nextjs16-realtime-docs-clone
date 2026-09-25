"use client"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"

import { Navbar } from "./navbar"
import { TemplatesGallery } from "./templates-gallery"

export default function Home() {
  const documents = useQuery(api.documents.get)

  if (documents === undefined) {
    return <p>Loading...</p>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
        {documents?.map((document) => (
          <span key={document._id}>{document.title}</span>
        ))}
      </div>
    </div>
  )
}
