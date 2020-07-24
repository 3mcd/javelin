import { World } from "@javelin/ecs"
import {
  JavelinMessage,
  SerializedComponentType,
  SerializedSchema,
  serializeWorldModel,
  MessageHandler,
  createMessageHandler,
} from "@javelin/net"
import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Devtool } from "./components/devtool"
import { LogContext, LogProvider } from "./context/log"
import { WorldProvider } from "./context/world_provider"
import { WorldConfig } from "./types"

export * from "./utils"

export type WorldsConfig = {
  [name: string]: World | { remote: true; world: World }
}

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
  const messageHandlerByWorld = new Map<World, MessageHandler>()
  const worldConfigs: WorldConfig[] = Object.entries(options.worlds).map(
    ([name, world]) =>
      "remote" in world
        ? {
            name,
            world: world.world,
            model: serializeWorldModel(world.world),
            remote: true,
          }
        : {
            name,
            world,
            model: serializeWorldModel(world),
            remote: false,
          },
  )

  let element: HTMLElement
  let interval: number

  function mount(root: HTMLElement) {
    const ref = React.createRef<LogContext>()
    const onMessage = (worldConfig: WorldConfig, message: JavelinMessage) => {
      const { world } = worldConfigs.find(wc => wc === worldConfig)!

      if (worldConfig.remote) {
        options.onMessage(world, message)
      } else {
        const messageHandler = messageHandlerByWorld.get(world)!
        messageHandler.push(message)
      }
    }
    const update = () =>
      render(
        <LogProvider ref={ref}>
          <WorldProvider worlds={worldConfigs} onMessage={onMessage}>
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
    const config = worldConfigs.find(config => config.world === world)

    if (config === undefined) {
      throw new Error("Cannot set model: world not registered with devtool")
    }

    config.model = model
  }

  for (const { world, remote } of worldConfigs) {
    if (!remote) {
      const handler = createMessageHandler()

      world.addSystem(handler.system)
      messageHandlerByWorld.set(world, handler)
    }
  }

  return {
    mount,
    unmount,
    setModel,
  }
}
