export type SocketConnection = {
  [Symbol.asyncIterator](): AsyncGenerator<MessageEvent<string>, void, unknown>
  close(): void
}

/**
 * Returns an async iterator that yields a new value every time a new message is received,
 * and closes when the socket is closed.
 * Errors if the socket failed to connect.
 */
export async function socket(
  url: string | URL,
  {
    signal,
  }: {
    signal?: AbortSignal
  } = {},
): Promise<SocketConnection> {
  const socket = new WebSocket(url)

  await new Promise<void>((resolve, reject) => {
    const handleOpen = () => {
      resolve()
      cleanup()
    }

    const handleError = () => {
      reject(new Error("Failed to connect to socket"))
      cleanup()
    }

    const handleAbort = () => {
      cleanup()
      socket.close()
      reject(new DOMException("Aborted", "AbortError"))
    }

    const cleanup = () => {
      socket.removeEventListener("open", handleOpen)
      socket.removeEventListener("error", handleError)
      signal?.removeEventListener("abort", handleAbort)
    }

    socket.addEventListener("open", handleOpen)
    socket.addEventListener("error", handleError)
    signal?.addEventListener("abort", handleAbort)
  })

  return {
    async *[Symbol.asyncIterator]() {
      while (socket.readyState === WebSocket.OPEN) {
        const event = await new Promise<MessageEvent | CloseEvent>(
          (resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
              resolve(event)
              cleanup()
            }

            const handleClose = (event: CloseEvent) => {
              resolve(event)
              cleanup()
            }

            const handleError = (event: Event) => {
              reject(
                event instanceof ErrorEvent ? event : new Error("Socket error"),
              )
              cleanup()
            }

            const handleAbort = () => {
              cleanup()
              socket.close()
              reject(new DOMException("Aborted", "AbortError"))
            }

            const cleanup = () => {
              socket.removeEventListener("message", handleMessage)
              socket.removeEventListener("close", handleClose)
              socket.removeEventListener("error", handleError)
              signal?.removeEventListener("abort", handleAbort)
            }

            socket.addEventListener("message", handleMessage)
            socket.addEventListener("close", handleClose)
            socket.addEventListener("error", handleError)
            signal?.addEventListener("abort", handleAbort)
          },
        )

        if (event instanceof MessageEvent) {
          yield event
        }

        if (event instanceof CloseEvent) {
          break
        }
      }
    },
    close() {
      socket.close()
    },
  }
}
