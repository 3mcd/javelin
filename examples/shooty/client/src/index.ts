import * as j from "@javelin/ecs"
import {
  clientPlugin,
  RemoteWorld,
  Transport,
  WebsocketTransport,
} from "@javelin/net"
import {Position, Vector2} from "../../server/model.js"

let socket = new WebSocket("ws://localhost:8080")

let app = j
  .app()
  .addInitSystem(world => {
    world.create(j.type(Transport), new WebsocketTransport(socket))
  })
  .addSystem(world => {
    world
      .getResource(RemoteWorld)
      .of(Position)
      .each((e, p) => {
        renderEntity(e, p)
      })
  })
  .use(clientPlugin)

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
  entityNode.textContent = `${e}: ${pos.x.toFixed(2)},${pos.y.toFixed(2)}`
}
