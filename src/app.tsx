import {
  For,
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createResource,
  createRoot,
  createSignal,
  type JSX,
} from "solid-js"
import { vinylApi } from "./data/vinyl-api.server"
import { destroySession } from "./data/vinyl-session"
import { type Room } from "./data/vinyl-types"
import { Login } from "./login"

const api = vinylApi()
const [user] = createResource(() => api.getUser())

const [screen, setScreen] = createSignal<
  { current: "room-list" } | { current: "room"; id: string }
>({ current: "room-list" })

const roomScreen = () => {
  const currentScreen = screen()
  return currentScreen.current === "room" && currentScreen
}

const [rooms, { refetch: refetchRooms }] = createResource(() => api.getRooms())

createRoot(() => {
  createEffect(() => {
    if (screen().current === "room-list") {
      void refetchRooms()
    }
  })
})

export function App() {
  return (
    <Show when={user()?.data} fallback={<Login />}>
      {(user) => (
        <>
          <header>
            <button onClick={() => setScreen(() => ({ current: "room-list" }))}>
              <h1>turntable</h1>
            </button>
            <p>hi, {user().display_name}!</p>
            <button
              onClick={() => {
                destroySession()
                window.location.reload()
              }}
            >
              Logout
            </button>
          </header>

          <main>
            <Suspense fallback={<p>Loading...</p>}>
              <ResultSwitch
                result={rooms()}
                error={(message) => <p>Failed to load rooms: {message()}</p>}
                data={(rooms) => (
                  <Switch fallback={<p>404</p>}>
                    <Match when={screen().current === "room-list"}>
                      <RoomListScreen
                        rooms={rooms()}
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        fallback={<NoRoomsState onRoomCreate={refetchRooms} />}
                      />
                    </Match>
                    <Match when={roomScreen()}>
                      {(screen) => (
                        <Show
                          when={rooms().find((room) => room.id === screen().id)}
                          fallback={<p>404</p>}
                        >
                          {(room) => <RoomScreen room={room()} />}
                        </Show>
                      )}
                    </Match>
                  </Switch>
                )}
              />
            </Suspense>
          </main>
        </>
      )}
    </Show>
  )
}

function RoomListScreen(props: { rooms: Room[]; fallback: JSX.Element }) {
  return (
    <For each={props.rooms} fallback={props.fallback}>
      {(room) => (
        <button
          onClick={() => setScreen(() => ({ current: "room", id: room.id }))}
        >
          {room.name}
        </button>
      )}
    </For>
  )
}

function NoRoomsState(props: { onRoomCreate: () => void }) {
  return (
    <p>
      You don't have any rooms yet.{" "}
      <button
        onClick={() => {
          const name = prompt("What do you want to name your room?")
          if (!name) return

          api.createRoom(name).then(props.onRoomCreate).catch(console.error)
        }}
      >
        Create one!
      </button>
    </p>
  )
}

function RoomScreen(props: { room: Room }) {
  return (
    <>
      <h1>{props.room.name}</h1>
      <p>Members:</p>
      <ul>
        <For each={props.room.connections}>
          {(user) => <li>{user.display_name}</li>}
        </For>
      </ul>
      <p>
        Now playing: {props.room.currentTrack?.metadata.title} by{" "}
        {props.room.currentTrack?.metadata.artist}
      </p>
    </>
  )
}

function ResultSwitch<T>(props: {
  result: { data?: T | null; error?: string | null } | undefined | null
  error: (message: () => string) => JSX.Element
  data: (data: () => T) => JSX.Element
}) {
  return (
    <Switch fallback={<p>Loading...</p>}>
      <Match when={props.result?.error}>
        {(error) => props.error(() => error())}
      </Match>
      <Match when={props.result?.data}>
        {(data) => props.data(() => data())}
      </Match>
    </Switch>
  )
}
