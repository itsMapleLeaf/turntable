"use client"
import { useMutation } from "@tanstack/react-query"
import { Disc } from "lucide-react"
import { useState } from "react"

const streamUrl = new URL(
  "/v1/audio/stream",
  process.env.NEXT_PUBLIC_SERVER_URL,
)
const submitUrl = new URL("/v1/audio/input", process.env.NEXT_PUBLIC_SERVER_URL)

export default function Home() {
  const [songUrl, setSongUrl] = useState("")

  const submitSong = useMutation({
    mutationFn: async () => {
      const response = await fetch(submitUrl, { method: "POST", body: songUrl })
      if (!response.ok) {
        throw new Error(
          `Failed to submit song (${response.status} ${response.statusText})`,
        )
      }
    },
    onSuccess() {
      setSongUrl("")
    },
  })

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-8">
        <h1 className="text-center text-5xl font-light flex items-center justify-center gap-2">
          <Disc className="w-10 h-10 translate-y-0.5" />
          <span>Vinyl</span>
        </h1>

        <section className="max-w-sm bg-black/75 w-full p-4 mx-auto">
          <h2>Add Song</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitSong.mutate()
            }}
          >
            <input
              placeholder="Stream URL"
              value={songUrl}
              onChange={(event) => setSongUrl(event.target.value)}
              className="bg-black/50"
            />
            <button>{submitSong.isLoading ? "Submitting..." : "Submit"}</button>
            {submitSong.error ? (
              <p className="text-red-400">
                {submitSong.error instanceof Error
                  ? submitSong.error.message
                  : "Could not submit song"}
              </p>
            ) : null}
          </form>
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
