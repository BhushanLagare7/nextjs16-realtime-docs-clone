import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"

import { UserButton } from "@clerk/nextjs"

import { SearchInput } from "./search-input"

export function Navbar() {
  return (
    <nav className="flex h-full w-full items-center justify-between">
      <div className="flex shrink-0 items-center gap-3 pr-6">
        <Link href="/">
          <Image alt="Logo" height={36} src="/logo.svg" width={36} />
        </Link>
        <h3 className="text-xl font-medium text-foreground">Scribe</h3>
      </div>
      <Suspense>
        <SearchInput />
      </Suspense>
      <UserButton />
    </nav>
  )
}
