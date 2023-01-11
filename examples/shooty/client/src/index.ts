import {app} from "@javelin/ecs"
import {
  clientPlugin,
  NetworkConfig,
  ServerTransport,
  websocketTransport,
} from "@javelin/net"
import {networkConfig} from "../../config.js"

let websocket = new WebSocket("ws://localhost:8080")

let game = app()
  .addResource(ServerTransport, websocketTransport(websocket))
  .addResource(NetworkConfig, networkConfig)
  .use(clientPlugin)

let loop = () => {
  game.step()
  requestAnimationFrame(loop)
}

loop()
