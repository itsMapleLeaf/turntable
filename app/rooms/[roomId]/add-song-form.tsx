"use client"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useAction } from "../../use-server-action"
import { submitSong } from "./actions"

export function AddSongForm() {
  const [songUrl, setSongUrl] = useState("")
  const action = useAction(submitSong)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (action.pending) return
        action.run(songUrl)
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
          data-pending={action.pending || undefined}
          className="flex items-center gap-2 p-2 border border-white/10 data-[pending]:opacity-50"
        >
          <Plus />
        </button>
      </div>
      {!action.pending && action.result?.error ? (
        <p className="text-error-400 text-sm">{action.result.error}</p>
      ) : null}
    </form>
  )
}
