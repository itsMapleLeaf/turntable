import * as Tooltip from "@radix-ui/react-tooltip"
import { type User } from "~/data/vinyl-types"

export function RoomMembers({ members }: { members: User[] }) {
  return (
    <Tooltip.Provider>
      <ul className="flex flex-row-reverse flex-wrap -space-x-2 space-x-reverse">
        {members.map((member) => (
          <li key={member.id} className="relative">
            <Tooltip.Root delayDuration={150}>
              <Tooltip.Trigger className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-700 bg-accent-900 text-xs font-medium leading-none">
                {firstCharacter(member.display_name).toUpperCase()}
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

function firstCharacter(text: string) {
  const codePoint = text.codePointAt(0)
  return codePoint ? String.fromCodePoint(codePoint) : ""
}
