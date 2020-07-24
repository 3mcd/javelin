import { createMessageProducer } from "@javelin/net"
import { World } from "@javelin/ecs"

export function createDevtoolMessageProducer(world: World) {
  return createMessageProducer({
    components: world.registeredComponentFactories.map(type => ({
      type,
      priority: 1,
    })),
    updateInterval: 1000,
    updateSize: 1000,
    isLocal: true,
  })
}
