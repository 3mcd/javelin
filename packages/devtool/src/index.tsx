import { World } from "@javelin/ecs"
import {
  JavelinMessage,
  SerializedComponentType,
  SerializedSchema,
  serializeWorldModel,
} from "@javelin/net"
import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Devtool } from "./components/devtool"
import { LogContext, LogProvider } from "./context/log"
import { WorldProvider } from "./context/world_provider"
import { WorldConfig } from "./types"

export type WorldsConfig = { [name: string]: World }

export type DevtoolOptions = {
  worlds: WorldsConfig
  onMessage: (world: World, message: JavelinMessage) => unknown
}

export type Devtool = {
  mount(root: HTMLElement): { log: LogContext }
  unmount(): void
  setModel(world: World, model: SerializedSchema[]): void
}

export function createDevtool(options: DevtoolOptions): Devtool {
  const worlds: WorldConfig[] = Object.entries(options.worlds).map(
    ([name, world]) => ({
      name,
      world,
      model: serializeWorldModel(world),
    }),
  )

  let element: HTMLElement
  let interval: number

  function mount(root: HTMLElement) {
    const ref = React.createRef<LogContext>()
    const onMessage = (world: WorldConfig, message: JavelinMessage) =>
      options.onMessage(options.worlds[world.name], message)
    const update = () =>
      render(
        <LogProvider ref={ref}>
          <WorldProvider worlds={worlds} onMessage={onMessage}>
            <Devtool />
          </WorldProvider>
        </LogProvider>,
        root,
      )

    update()

    element = root

    interval = setInterval(update, 500)

    return {
      log: ref.current!,
    }
  }

  function unmount() {
    clearInterval(interval)
    unmountComponentAtNode(element)
  }

  function setModel(world: World, model: SerializedComponentType[]) {
    const config = worlds.find(config => config.world === world)

    if (config === undefined) {
      throw new Error("Cannot set model: world not registered with devtool")
    }

    config.model = model
  }

  return {
    mount,
    unmount,
    setModel,
  }
}
