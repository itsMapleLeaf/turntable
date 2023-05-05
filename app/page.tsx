"use client"
import { Disc } from "lucide-react"
import { useState, useTransition } from "react"
import { submitSong } from "./actions"

const streamUrl = new URL(
  "/v1/audio/stream",
  process.env.NEXT_PUBLIC_SERVER_URL,
)

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-8">
        <h1 className="text-center text-5xl font-light flex items-center justify-center gap-2">
          <Disc className="w-10 h-10 translate-y-0.5" />
          <span>Vinyl</span>
        </h1>

        <section className="max-w-sm bg-black/75 w-full p-4 mx-auto">
          <h2>Add Song</h2>
          <AddSongForm />
        </section>

        <section className="max-w-sm bg-black/75 w-full p-4 mx-auto flex-1">
          <h2>Playlist</h2>
        </section>
      </main>
      <footer className="bg-black border-white/10 border-t sticky bottom-0">
        <button onClick={() => new Audio(streamUrl.href).play()}>Play</button>
      </footer>
    </>
  )
}

function AddSongForm() {
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
