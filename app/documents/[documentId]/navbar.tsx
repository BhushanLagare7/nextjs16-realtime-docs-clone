"use client"

import Image from "next/image"
import Link from "next/link"

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

import { Menubar } from "@/components/ui/menubar"
import type { Doc } from "@/convex/_generated/dataModel"

import { EditMenu } from "./navbar/edit-menu"
import { FileMenu } from "./navbar/file-menu"
import { FormatMenu } from "./navbar/format-menu"
import { InsertMenu } from "./navbar/insert-menu"
import { Avatars } from "./avatars"
import { DocumentInput } from "./document-input"
import { Inbox } from "./inbox"

/** Props for the Navbar component. */
interface NavbarProps {
  data: Doc<"documents">
}

/**
 * Top navigation bar providing document branding, title editing, and menu controls.
 */
export function Navbar({ data }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image alt="Logo" height={36} src="/logo.svg" width={36} />
        </Link>
        <div className="flex flex-col">
          <DocumentInput id={data._id} title={data.title} />
          <div className="flex">
            <Menubar className="h-auto border-none bg-transparent p-0 shadow-none">
              <FileMenu data={data} />
              <EditMenu />
              <InsertMenu />
              <FormatMenu />
            </Menubar>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-6">
        <Avatars />
        <Inbox />
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/"
          afterLeaveOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          afterSelectPersonalUrl="/"
        />
        <UserButton />
      </div>
    </nav>
  )
}
