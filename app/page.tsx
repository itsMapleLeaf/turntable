"use client"
import { useMutation } from "@tanstack/react-query"
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
    <main>
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
      <hr />
      <button onClick={() => new Audio(streamUrl.href).play()}>Play</button>
    </main>
  )
}
