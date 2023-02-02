import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {ServerWorld} from "@javelin/net"
import {Input, networkModel, Position, Vector2} from "../../server/model.js"

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
  .addResource(jn.NetworkModel, networkModel)
  .addInitSystem(world => {
    world.create(j.type(jn.Transport), new jn.WebsocketTransport(socket))
  })
  .addSystemToGroup(j.FixedGroup.EarlyUpdate, world => {
    let serverWorld = world.getResource(jn.ServerWorld)
    serverWorld
      .of(Position)
      .as()
      .each(entity => {
        if (keys.w) {
          world.getResource(jn.ServerWorld).dispatch(Input, entity)
        }
      })
  })
  .addSystem(world => {
    let serverWorld = world.getResource(jn.ServerWorld)
    serverWorld.of(Position).each((entity, pos) => {
      renderEntity(entity, pos)
    })
  })
  .use(jn.clientPlugin)

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
