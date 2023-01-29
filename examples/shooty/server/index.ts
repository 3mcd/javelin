import * as j from "@javelin/ecs"
import {
  awareness,
  Client,
  presence,
  serverPlugin,
  WebsocketTransport,
} from "@javelin/net"
import {createServer} from "http"
import {WebSocket, WebSocketServer} from "ws"
import {Position, Velocity} from "./model.js"

let httpServer = createServer()

let websocketServer = new WebSocketServer({server: httpServer})
let openedWebsocketQueue: WebSocket[] = []
let closedClientQueue: j.Entity[] = []

let i = 0

let app = j
  .app()
  .addSystem(
    world => {
      world.create(j.type(Position, Velocity), undefined, {
        x: Math.random(),
        y: -i / 5,
      })
    },
    null,
    () => i++ % 5 == 0,
  )
  .addSystem(world => {
    world.of(j.type(Position, Velocity)).each((_, p, v) => {
      p.x += v.x
      p.y += v.y
    })
  })
  .addSystemToGroup(j.Group.Early, world => {
    let socket: WebSocket | undefined
    while ((socket = openedWebsocketQueue.pop())) {
      if (socket.readyState !== socket.OPEN) {
        continue
      }
      let clientTransport = new WebsocketTransport(socket as any)
      let clientKineticPresence = presence(
        192847 as j.Entity,
        j.type(Position, Velocity),
      )
      let clientAwareness = awareness().addPresence(clientKineticPresence)
      let client = world.create(Client, clientTransport, clientAwareness)
      // @ts-ignore
      clientKineticPresence.entity = client
      socket.on("close", () => {
        closedClientQueue.push(client)
      })
    }
    let client: j.Entity | undefined
    while ((client = closedClientQueue.pop()) !== undefined) {
      world.delete(client)
    }
  })
  .use(serverPlugin)

websocketServer.on("connection", socket => {
  openedWebsocketQueue.push(socket)
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
  app.step()
}, 1000)
