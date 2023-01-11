import {app, Group, type} from "@javelin/ecs"
import {
  awareness,
  Client,
  interest,
  NetworkConfig,
  NetworkId,
  server_plugin,
  NetworkTransport,
} from "@javelin/net"
import {createServer} from "http"
import {WebSocket, WebSocketServer} from "ws"
import {network_config} from "../config.js"
import {Transform} from "./transform.js"

let http_server = createServer()

let websocket_server = new WebSocketServer({server: http_server})
let websocket_transport = (
  websocket: WebSocket,
): NetworkTransport => {
  let inbox: Uint8Array[] = []
  websocket.binaryType = "arraybuffer"
  websocket.on("message", data => {
    inbox.unshift(new Uint8Array(data as ArrayBuffer))
  })
  return {
    send(message: Uint8Array) {
      websocket.send(message)
    },
    recv() {
      return inbox.pop()
    },
  }
}
let websocket_queue: WebSocket[] = []

let transform_interest = interest(type(Transform).type)

let game = app()
  .add_resource(NetworkConfig, network_config)
  .add_system_to_group(Group.Init, world => {
    world.create(type(Transform, NetworkId))
  })
  .add_system_to_group(Group.Early, world => {
    let websocket: WebSocket | undefined
    while ((websocket = websocket_queue.pop())) {
      if (websocket.readyState !== websocket.OPEN) {
        continue
      }
      let client_transport = websocket_transport(websocket)
      let client_awareness = awareness().add_interest(
        transform_interest,
      )
      let client = world.create(
        Client,
        client_transport,
        client_awareness,
      )
      websocket.on("close", () => {
        world.delete(client)
      })
    }
  })
  .use(server_plugin)

websocket_server.on("connection", websocket => {
  websocket_queue.push(websocket)
})

http_server.listen(8080)

console.log(`
call of
  .::::::.   ::   .:      ...         ...     ::::::::::::.-:.     ::-.
 ;;;\`    \`  ,;;   ;;,  .;;;;;;;.   .;;;;;;;.  ;;;;;;;;'''' ';;.   ;;;;'
  '[==/[[[[,,[[[,,,[[[ ,[[     \[[,,[[     \[[,     [[        '[[,[[['
  '''    $"$$$"""$$$ $$$,     $$$$$$,     $$$     $$          c$$"
 88b    dP 888   "88o"888,_ _,88P"888,_ _,88P     88,       ,8P"\`
  "YMmMY"  MMM    YMM  "YMMMMMP"   "YMMMMMP"      MMM      mM"
`)

console.log("server listening on port 8080")

setInterval(() => {
  game.step()
}, 1000 / 60)
