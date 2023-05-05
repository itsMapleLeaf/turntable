"use client"
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
        startTransition(async () => {
          const result = await submitSong(songUrl)
          if (result.error) setError(result.error)
        })
      }}
    >
      <input
        placeholder="Stream URL"
        value={songUrl}
        onChange={(event) => setSongUrl(event.target.value)}
        className="bg-black/50"
      />
      <button>{pending ? "Submitting..." : "Submit"}</button>
      {error ? <p className="text-red-400">{error}</p> : null}
    </form>
  )
}
