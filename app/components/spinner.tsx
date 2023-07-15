import { twMerge } from "tailwind-merge"

export function Spinner({
  size = 5,
  className,
}: {
  size?: 4 | 5
  className?: string
}) {
  const sizeClasses = {
    4: "h-4 w-4 gap-0.5",
    5: "h-5 w-5 gap-1",
  }
  return (
    <span
      className={twMerge(
        "grid animate-spin grid-cols-2 grid-rows-2",
        sizeClasses[size],
        className,
      )}
    >
      <span className="rounded-full bg-accent-200" />
      <span className="rounded-full bg-accent-200" />
      <span className="rounded-full bg-accent-200" />
      <span className="rounded-full bg-accent-200" />
    </span>
  )
}
