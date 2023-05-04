"use client"
import { useState } from "react"

const streamUrl = new URL(
  "./v1/audio/stream",
  process.env.NEXT_PUBLIC_SERVER_URL,
)
const inputUrl = new URL("./v1/audio/input", process.env.NEXT_PUBLIC_SERVER_URL)

const stream = new Audio(streamUrl.href)

export default function Home() {
  const [songUrl, setSongUrl] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const response = await fetch(inputUrl, {
      method: "POST",
      body: songUrl,
    })
    if (!response.ok) {
      alert("oops lol")
    }

    setSongUrl("")
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Stream URL"
          value={songUrl}
          onChange={(event) => setSongUrl(event.target.value)}
          className="bg-black/50"
        />
        <button>Submit</button>
      </form>
      <hr />
      <button onClick={() => stream.play()}>Play</button>
    </main>
  )
}
