import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {Identity, identityMessage} from "../../shared/identity.js"
import {Input, model, Position, Vector2} from "../../shared/model.js"

let socket = new WebSocket("ws://localhost:8080")

let keys: Record<string, boolean> = {}

document.addEventListener("keydown", e => {
  keys[e.key] = true
})
document.addEventListener("keyup", e => {
  keys[e.key] = false
})

let app = j
  .app()
  .addResource(jn.NetworkModel, model)
  .addInitSystem(world => {
    world.create(j.type(jn.Server), jn.makeWebsocketTransport(socket))
  })
  .addSystemToGroup(
    j.FixedGroup.EarlyUpdate,
    world => {
      let commands = world.getResource(j.Commands)
      let identity = world.getResource(Identity)
      if (keys.w) {
        commands.dispatch(Input, {entity: identity})
      }
    },
    null,
    world => world.tryGetResource(Identity) !== undefined,
  )
  .addSystem(world => {
    let remote = world.getResource(jn.ServerWorld)
    remote.query(Position).each((entity, pos) => {
      renderEntity(entity, pos)
    })
  })
  .use(jn.clientPlugin)
  .use(app => {
    let protocol = app.getResource(jn.Protocol)!
    protocol.register(identityMessage, 99)
  })

let loop = () => {
  app.step()
  requestAnimationFrame(loop)
}

loop()

let entityNodes = [] as HTMLDivElement[]
let renderEntity = (entity: j.Entity, pos: Vector2) => {
  let entityNode = entityNodes[entity]
  if (entityNode === undefined) {
    entityNode = document.createElement("div")
    entityNode.classList.add("entity")
    entityNodes[entity] = entityNode
    document.body.appendChild(entityNode)
  }
  entityNode.textContent = `${entity}: ${pos.x.toFixed(2)},${pos.y.toFixed(2)}`
}
