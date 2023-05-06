import { PlayCircle } from "lucide-react"

export function Player() {
  return (
    <footer className="panel border-t p-4 sticky bottom-0">
      <div className="container flex items-center">
        <p className="leading-5 flex-1">
          <span className="text-sm opacity-75">Now playing</span>
          <br />
          Something
        </p>
        <button>
          <PlayCircle aria-hidden className="w-8 h-8" />
          <span className="sr-only">Play</span>
        </button>
      </div>
    </footer>
  )
}
