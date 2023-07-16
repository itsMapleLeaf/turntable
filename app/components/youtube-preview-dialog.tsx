import * as Dialog from "@radix-ui/react-dialog"
import { LucideX } from "lucide-react"
import { createContext, useContext, useState, type ReactNode } from "react"

const YouTubePreviewContext = createContext({
  open: false,
  setOpen: (open: boolean) => {},
  videoId: "",
  setVideoId: (videoId: string) => {},
})

export function YouTubePreviewProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [videoId, setVideoId] = useState("")
  return (
    <YouTubePreviewContext.Provider
      value={{ open, setOpen, videoId, setVideoId }}
    >
      {children}
      <YouTubePreviewDialog />
    </YouTubePreviewContext.Provider>
  )
}

export function useYouTubePreview() {
  const context = useContext(YouTubePreviewContext)

  const show = (videoId: string) => {
    context.setVideoId(videoId)
    context.setOpen(true)
  }

  const hide = () => {
    context.setOpen(false)
  }

  return { show, hide, open: context.open }
}

export function YouTubePreviewDialog() {
  const context = useContext(YouTubePreviewContext)
  return (
    <Dialog.Root open={context.open} onOpenChange={context.setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 flex flex-col overflow-y-auto bg-black bg-opacity-50 p-4 backdrop-blur-lg">
          <Dialog.Content className="panel m-auto flex w-full max-w-[calc(100vh*(16/9)-16rem)] flex-col border">
            <iframe
              title="YouTube Preview"
              className="aspect-video w-full border-none"
              src={`https://www.youtube.com/embed/${context.videoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
            />
            <Dialog.Close className="active-press flex items-center justify-center gap-2 py-3 hover:text-accent-300">
              <LucideX /> Close
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
