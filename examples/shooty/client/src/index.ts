import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {networkModel, Position, Vector2} from "../../server/model.js"

let socket = new WebSocket("ws://localhost:8080")

let i = 0
let app = j
  .app()
  .addResource(jn.NetworkModel, networkModel)
  .addInitSystem(world => {
    world.create(j.type(jn.Transport), new jn.WebsocketTransport(socket))
  })
  .addSystem(
    world => {
      let serverWorld = world.getResource(jn.ServerWorld)
      serverWorld.of(Position).each((e, p) => {
        renderEntity(e, p)
      })
    },
    null,
    () => i % 2 === 0,
  )
  .use(jn.clientPlugin)

let loop = () => {
  app.step()
  requestAnimationFrame(loop)
}

loop()

let entityNodes = [] as HTMLDivElement[]
let renderEntity = (e: j.Entity, pos: Vector2) => {
  let entityNode = entityNodes[e]
  if (entityNode === undefined) {
    entityNode = document.createElement("div")
    entityNode.classList.add("entity")
    entityNodes[e] = entityNode
    document.body.appendChild(entityNode)
  }
  entityNode.textContent = `${e} ${pos.x.toFixed(2)},${pos.y.toFixed(2)}`
}
