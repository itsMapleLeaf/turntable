export function Spinner() {
  return (
    <div className="grid h-5 w-5 animate-spin grid-cols-2 grid-rows-2 gap-1">
      <div className="rounded-full bg-accent-200" />
      <div className="rounded-full bg-accent-200" />
      <div className="rounded-full bg-accent-200" />
      <div className="rounded-full bg-accent-200" />
    </div>
  )
}
