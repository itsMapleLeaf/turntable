import { type ActionArgs, json, redirect } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { UserPlus } from "lucide-react"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { FormLayout } from "~/components/form-layout"
import { Label } from "~/components/label"
import { vinylApi } from "~/data/vinyl-api.server"
import { toError } from "~/helpers/errors"
import { usePendingSubmit } from "~/helpers/use-pending-submit"

export async function action({ request }: ActionArgs) {
  try {
    const form = zfd
      .formData({ name: zfd.text() })
      .parse(await request.formData())

    const room = await vinylApi(request).createRoom(form.name)
    return redirect(`/rooms/${room.id}`)
  } catch (error) {
    return json({ error: toError(error).message }, { status: 500 })
  }
}

export default function CreateRoomPage() {
  const pending = usePendingSubmit()
  const { error } = useActionData<typeof action>() ?? {}
  return (
    <FormLayout title="Create a room" error={error}>
      <Label text="Room name">
        <input
          name="name"
          type="text"
          placeholder="only bangers allowed"
          className="input"
          required
        />
      </Label>
      <Button
        label="Create"
        pendingLabel="Creating..."
        iconElement={<UserPlus />}
        pending={pending}
      />
    </FormLayout>
  )
}
