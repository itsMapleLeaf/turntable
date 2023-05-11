export function Spinner() {
  return (
    <div className="grid grid-rows-2 grid-cols-2 w-5 h-5 gap-1 animate-spin">
      <div className="bg-accent-200 rounded-full" />
      <div className="bg-accent-200 rounded-full" />
      <div className="bg-accent-200 rounded-full" />
      <div className="bg-accent-200 rounded-full" />
    </div>
  )
}
