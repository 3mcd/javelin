import {app} from "@javelin/ecs"
import {
  client_plugin,
  NetworkConfig,
  ServerTransport,
  websocket_transport,
} from "@javelin/net"
import {network_config} from "../../config.js"

let websocket = new WebSocket("ws://localhost:8080")

let game = app()
  .add_resource(ServerTransport, websocket_transport(websocket))
  .add_resource(NetworkConfig, network_config)
  .use(client_plugin)

let loop = () => {
  game.step()
  requestAnimationFrame(loop)
}

loop()
