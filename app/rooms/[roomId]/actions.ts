"use server"

const submitUrl = new URL("/v1/audio/input", process.env.NEXT_PUBLIC_SERVER_URL)

export async function submitSong(songUrl: string) {
  try {
    const response = await fetch(submitUrl, { method: "POST", body: songUrl })
    if (!response.ok) {
      return {
        error: `Failed to submit song (${response.status} ${response.statusText})`,
      }
    }
    return {}
  } catch (error) {
    const message =
      error instanceof Error
        ? `Failed to submit song: ${error.message}`
        : "Failed to submit song"
    return { error: message }
  }
}
