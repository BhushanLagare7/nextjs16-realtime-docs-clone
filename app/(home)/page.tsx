"use client"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"

import { Navbar } from "./navbar"
import { TemplatesGallery } from "./templates-gallery"

export default function Home() {
  const documents = useQuery(api.documents.get)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
        {documents === undefined ? (
          <p>Loading...</p>
        ) : (
          documents.map((document) => (
            <span key={document._id}>{document.title}</span>
          ))
        )}
      </div>
    </div>
  )
}
