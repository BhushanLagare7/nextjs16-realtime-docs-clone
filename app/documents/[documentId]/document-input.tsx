import { BsCloudCheck } from "react-icons/bs"

/**
 * Header input component displaying the document title and cloud sync indicator.
 */
export function DocumentInput() {
  return (
    <div className="flex items-center gap-2">
      <span className="cursor-pointer truncate px-1.5 text-lg">
        Untitled Document
      </span>
      <BsCloudCheck />
    </div>
  )
}
