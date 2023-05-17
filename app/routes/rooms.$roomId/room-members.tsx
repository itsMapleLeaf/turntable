import * as Tooltip from "@radix-ui/react-tooltip"
import { useRoomMembers } from "./room-state-context"

export function RoomMembers() {
  const members = useRoomMembers()
  return (
    <Tooltip.Provider>
      <ul className="flex flex-row-reverse -space-x-2 space-x-reverse">
        {[...members.values()]
          .sort((a, b) => b.display_name.localeCompare(a.display_name))
          .map((member) => (
            <li key={member.id} className="relative">
              <Tooltip.Root delayDuration={150}>
                <Tooltip.Trigger className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-700 bg-accent-900 text-xs font-medium leading-none">
                  {member.display_name[0]?.toUpperCase()}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={8}
                    className="radix-fade-zoom-transition rounded-sm border border-accent-700 bg-accent-900/75 p-1 text-xs leading-none shadow-md shadow-black/50"
                  >
                    {member.display_name}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </li>
          ))}
      </ul>
    </Tooltip.Provider>
  )
}
