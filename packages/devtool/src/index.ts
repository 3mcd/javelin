import { createWorld, World } from "@javelin/ecs"
import {
  createMessageHandler,
  JavelinMessage,
  createMessageProducer,
} from "@javelin/net"
import m from "mithril"
import { Devtool } from "./components/devtool"

export function createDevTool(
  source?: World,
  onMessage?: (message: JavelinMessage) => unknown,
) {
  const world = createWorld([m.redraw])
  const handler = createMessageHandler(world)

  let update = () => world.tick(undefined)

  if (source) {
    const producer = createMessageProducer({
      components: source.registeredComponentFactories.map(type => ({ type })),
      maxUpdateSize: Infinity,
      unreliableSendRate: 0,
    })
    handle(producer.all(source))
    update = () => {
      handle(producer.created(source))
      handle(producer.destroyed(source))
      world.tick(undefined)
    }
  }

  let element: HTMLElement
  let interval: NodeJS.Timeout

  function mount(root: HTMLElement) {
    m.mount(root, Devtool(world, onMessage))
    element = root
    interval = setInterval(update, 500)
  }

  function unmount() {
    clearInterval(interval)
    element.removeChild(element.children[0])
  }

  function handle(message: JavelinMessage | false) {
    if (message) {
      handler.applyMessage(message)
    }
  }

  return {
    mount,
    unmount,
    handle,
  }
}
