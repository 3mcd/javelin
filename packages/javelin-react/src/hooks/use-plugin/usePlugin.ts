import { App } from "@javelin/ecs";
import { useApp } from "../../Javelin";
import useIsomorphicLayoutEffect from "../useIsomorphicLayoutEffect";

export type UsePluginCallback = (app: App) => void

export function usePlugin(usePluginCallback: UsePluginCallback) {
  const app = useApp()
  
  useIsomorphicLayoutEffect(() => {
    usePluginCallback(app)
  }, [app, usePluginCallback])
}