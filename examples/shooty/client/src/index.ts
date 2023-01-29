import * as j from "@javelin/ecs"
import {clientPlugin, Transport, WebsocketTransport} from "@javelin/net"
import "../../server/transform.ts"

let socket = new WebSocket("ws://localhost:8080")

let app = j
  .app()
  .addInitSystem(world => {
    world.create(j.type(Transport), new WebsocketTransport(socket))
  })
  .use(clientPlugin)

let loop = () => {
  app.step()
  requestAnimationFrame(loop)
}

loop()
