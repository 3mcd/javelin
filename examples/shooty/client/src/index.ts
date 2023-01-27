import {app, type} from "@javelin/ecs"
import {clientPlugin, Transport, WebsocketTransport} from "@javelin/net"
import "../../server/transform.ts"

let socket = new WebSocket("ws://localhost:8080")

let game = app()
  .addInitSystem(world => {
    world.create(type(Transport), new WebsocketTransport(socket))
  })
  .use(clientPlugin)

let loop = () => {
  game.step()
  requestAnimationFrame(loop)
}

loop()
