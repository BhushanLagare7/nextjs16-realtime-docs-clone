import { Navbar } from "./navbar"
import { TemplatesGallery } from "./templates-gallery"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 right-0 left-0 z-10 h-16 bg-background p-4">
        <Navbar />
      </div>
      <div className="mt-16">
        <TemplatesGallery />
      </div>
    </div>
  )
}
