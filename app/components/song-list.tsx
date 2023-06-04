import prettyMilliseconds from "pretty-ms"
import { type Nullish } from "~/helpers/types"

export function SongList({ children }: { children: React.ReactNode }) {
  return <ul className="panel border">{children}</ul>
}

export function SongListItem({
  link,
  artwork,
  artist,
  durationSeconds,
  title,
  addedBy,
  addedFrom,
  isActive,
}: {
  link: string
  artwork?: Nullish<string>
  artist: string
  durationSeconds: number
  title: string
  addedBy: string
  addedFrom: string
  isActive?: boolean
}) {
  return (
    <li className="-m-px">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        data-active={isActive || undefined}
        className="group flex flex-row gap-3 border border-transparent from-accent-200/10 p-3 transition-colors hover:text-accent-200 data-[active]:border-accent-200/25 data-[active]:bg-gradient-to-r data-[active]:text-accent-200"
      >
        {artwork ? (
          <img
            src={artwork}
            alt=""
            className="h-12 w-12 rounded border border-white/10 object-cover transition-colors group-hover:border-accent-200/25"
          />
        ) : null}
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm/5 opacity-75">
            {artist} &bull;{" "}
            {prettyMilliseconds(durationSeconds * 1000, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}{" "}
            &bull; added by {addedBy} &bull; {addedFrom}
          </p>
          <p className="text-lg/5">{title}</p>
        </div>
      </a>
    </li>
  )
}
