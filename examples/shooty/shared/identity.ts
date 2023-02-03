import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"

export let Identity = j.resource<j.Entity>()

export let identityMessage = jn.message(
  (stream, _, entity: j.Entity) => {
    stream.grow(4)
    stream.writeU32(entity)
  },
  (stream, world) => world.setResource(Identity, stream.readU32()),
)
