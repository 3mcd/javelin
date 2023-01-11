import {app, Group, type} from "@javelin/ecs"
import {
  awareness,
  Client,
  interest,
  NetworkConfig,
  NetworkId,
  serverPlugin,
  NetworkTransport,
} from "@javelin/net"
import {createServer} from "http"
import {WebSocket, WebSocketServer} from "ws"
import {networkConfig} from "../config.js"
import {Transform} from "./transform.js"

let httpServer = createServer()

let websocketServer = new WebSocketServer({server: httpServer})
let websocketTransport = (
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
let websocketQueue: WebSocket[] = []

let transformInterest = interest(type(Transform).type)

let game = app()
  .addResource(NetworkConfig, networkConfig)
  .addSystemToGroup(Group.Init, world => {
    world.create(type(Transform, NetworkId))
  })
  .addSystemToGroup(Group.Early, world => {
    let websocket: WebSocket | undefined
    while ((websocket = websocketQueue.pop())) {
      if (websocket.readyState !== websocket.OPEN) {
        continue
      }
      let clientTransport = websocketTransport(websocket)
      let clientAwareness = awareness().addInterest(
        transformInterest,
      )
      let client = world.create(
        Client,
        clientTransport,
        clientAwareness,
      )
      websocket.on("close", () => {
        world.delete(client)
      })
    }
  })
  .use(serverPlugin)

websocketServer.on("connection", websocket => {
  websocketQueue.push(websocket)
})

httpServer.listen(8080)

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
