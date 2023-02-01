import {App} from "@javelin/ecs"
import {useApp} from "../../Javelin"
import useIsomorphicLayoutEffect from "../useIsomorphicLayoutEffect"

export type UsePluginCallback = (app: App) => void | VoidFunction

export function usePlugin(
  usePluginCallback: UsePluginCallback,
  deps: any[] = [],
) {
  const app = useApp()

  useIsomorphicLayoutEffect(() => {
    return usePluginCallback(app)
  }, [app, usePluginCallback, ...deps])
}
