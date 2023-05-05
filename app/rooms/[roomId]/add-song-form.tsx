"use client"
import { Plus } from "lucide-react"
import { useState, useTransition } from "react"
import { submitSong } from "./actions"

export function AddSongForm() {
  const [songUrl, setSongUrl] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (pending) return
        startTransition(async () => {
          setError(undefined)
          const result = await submitSong(songUrl)
          if (result.error) setError(result.error)
        })
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-row gap-2">
        <input
          placeholder="Stream URL"
          value={songUrl}
          onChange={(event) => setSongUrl(event.target.value)}
          className="bg-transparent/50 flex-1 px-3 py-2 border border-white/10 min-w-0"
        />
        <button
          data-pending={pending || undefined}
          className="flex items-center gap-2 p-2 border border-white/10 data-[pending]:opacity-50"
        >
          <Plus />
        </button>
      </div>
      {error ? <p className="text-error-400 text-sm">{error}</p> : null}
    </form>
  )
}
