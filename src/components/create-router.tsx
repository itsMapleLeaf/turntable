import { createBrowserHistory } from "history"
import { pathToRegexp } from "path-to-regexp"
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react"
import { raise } from "../helpers/errors"
import { type Simplify } from "../helpers/types"

/**
 * Converts a path pattern to a valid link href type
 * @example
 * type Result = ToLinkHref<"/rooms/:roomId"> // `/rooms/${string}`
 */
type ToLinkHref<PathPattern extends string, Slug extends string> = PathPattern extends // eslint-disable-next-line @typescript-eslint/no-unused-vars
`${infer Start}:${infer _Param}/${infer Rest}`
  ? `${Start}${SafeSlug<Slug>}${ToLinkHref<`/${Rest}`, Slug>}`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  : PathPattern extends `${infer Start}:${infer _Param}` ? `${Start}${SafeSlug<Slug>}`
  : PathPattern

type SearchOrHash = `?${string}` | `#${string}`

type SafeSlug<S extends string> = S extends `${string}/${string}` ? never
  : S extends `${string}${SearchOrHash}` ? never
  : S extends "" ? never
  : S

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PathParamKeys<P extends string> = P extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? Param | keyof PathParams<`/${Rest}`>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  : P extends `${infer _Start}:${infer Param}` ? Param
  : never

type PathParams<P extends string> = Simplify<Record<PathParamKeys<P>, string>>

export function createRouter<RoutePath extends string>() {
  type LinkHref<Slug extends string> = ToLinkHref<RoutePath, Slug>

  const history = createBrowserHistory()

  function useRouterProvider() {
    const [location, setLocation] = useState(history.location)
    useEffect(() => history.listen(({ location }) => setLocation(location)), [])
    return { location }
  }

  const RouterContext = createContext<ReturnType<typeof useRouterProvider> | undefined>(undefined)

  function Router({ children }: { children: ReactNode }) {
    return (
      <RouterContext.Provider value={useRouterProvider()}>
        {children}
      </RouterContext.Provider>
    )
  }

  function Route<P extends RoutePath>(props: {
    path: P
    component?: ComponentType<{ params: PathParams<P> }>
    children?: ReactNode | ((params: PathParams<P>) => ReactNode)
  }) {
    const router = useRouterProvider() ?? raise("<Router> component is missing")
    const regexp = useMemo(() => pathToRegexp(props.path), [props.path])

    const match = router.location.pathname.match(regexp)
    if (!match) return

    if (props.component) return <props.component params={match.groups as PathParams<P>} />
    if (typeof props.children === "function") return props.children(match.groups as PathParams<P>)
    return props.children
  }

  function Link<Slug extends string>({ children, replace, ...props }: {
    href: LinkHref<Slug>
    replace?: boolean
  } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    return <a
      {...props}
      onClick={(event) => {
        event.preventDefault()

        const currentHref = history.location.pathname
          + history.location.search
          + history.location.hash

        if (currentHref === props.href) return

        if (replace) {
          history.replace(props.href)
        } else {
          history.push(props.href)
        }
      }}
    >
      {children}
    </a>
  }

  return { Router, Route, Link }
}
