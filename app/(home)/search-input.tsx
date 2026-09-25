"use client"

import { type ChangeEvent, type FormEvent, useRef, useState } from "react"

import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParam } from "@/hooks/use-search-param"

export function SearchInput() {
  const [search, setSearch] = useSearchParam()
  const [value, setValue] = useState(search)
  const [prevSearch, setPrevSearch] = useState(search)

  if (search !== prevSearch) {
    setPrevSearch(search)
    setValue(search)
  }

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleClear = () => {
    setValue("")
    setSearch("")
    inputRef.current?.blur()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearch(value)
    inputRef.current?.blur()
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form className="relative w-full max-w-180" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          className="h-12 w-full rounded-full border-none bg-secondary px-14 text-foreground placeholder:text-muted-foreground focus-visible:bg-background focus-visible:shadow-md focus-visible:ring-0 md:text-base"
          placeholder="Search"
          value={value}
          onChange={handleChange}
        />
        <Button
          aria-label="Search"
          className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full [&_svg]:size-5"
          size="icon"
          type="submit"
          variant="ghost"
        >
          <SearchIcon />
        </Button>
        {value && (
          <Button
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full [&_svg]:size-5"
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleClear}
          >
            <XIcon />
          </Button>
        )}
      </form>
    </div>
  )
}
