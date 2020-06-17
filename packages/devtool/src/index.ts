import { World } from "@javelin/ecs"
import { JavelinMessage } from "@javelin/net"
import m from "mithril"
import { Devtool } from "./components/devtool"

export type WorldsConfig = { [name: string]: World }

export type DevtoolOptions = {
  worlds: WorldsConfig
  onMessage: (world: World, message: JavelinMessage) => unknown
}

export type Devtool = {
  mount(root: HTMLElement): void
  unmount(): void
}

export function createDevtool(options: DevtoolOptions): Devtool {
  const worlds = Object.entries(options.worlds).map(([name, world]) => ({
    name,
    world,
  }))

  let element: HTMLElement
  let interval: NodeJS.Timeout

  function update() {
    m.redraw()
  }

  function mount(root: HTMLElement) {
    m.mount(root, Devtool(worlds, options.onMessage))
    element = root
    interval = setInterval(update, 500)
  }

  function unmount() {
    clearInterval(interval)
    element.removeChild(element.children[0])
  }

  return {
    mount,
    unmount,
  }
}
