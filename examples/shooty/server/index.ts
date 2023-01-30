import * as j from "@javelin/ecs"
import {Entity, Group, resource} from "@javelin/ecs"
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

let http = createServer()
let wss = new WebSocketServer({server: http})

let Tick = resource<number>()
let SocketsOpened = resource<WebSocket[]>()
let ClientsClosed = resource<Entity[]>()

let i = 0

let app = j
  .app()
  .addResource(Tick, 0)
  .addResource(SocketsOpened, [])
  .addResource(ClientsClosed, [])
  .addSystemToGroup(Group.Early, world => {
    world.setResource(Tick, world.getResource(Tick) + 1)
  })
  .addSystem(
    world => {
      world.create(j.type(Velocity, Position), {
        x: Math.random(),
        y: -i / 5,
      })
    },
    null,
    world => {
      let tick = world.getResource(Tick)
      return tick % 5 === 0 && tick < 1000
    },
  )
  .addSystem(world => {
    world.of(j.type(Position, Velocity)).each((_, p, v) => {
      p.x += v.x
      p.y += v.y
    })
  })
  .addSystemToGroup(j.Group.Early, world => {
    let socket: WebSocket | undefined
    let socketsOpened = world.getResource(SocketsOpened)
    let clientsClosed = world.getResource(ClientsClosed)
    while ((socket = socketsOpened.pop())) {
      if (socket.readyState !== socket.OPEN) {
        continue
      }
      let clientTransport = new WebsocketTransport(
        socket as unknown as globalThis.WebSocket,
      )
      let client = world.create()
      let clientKineticPresence = presence(
        client,
        j.type(Position, Velocity),
        (_, subjectEntity) => (subjectEntity % 2 === 0 ? 100 : 10),
      )
      let clientAwareness = awareness().addPresence(clientKineticPresence)
      world.add(client, Client, clientTransport, clientAwareness)
      socket.on("close", () => {
        clientsClosed.push(client)
      })
    }
    let client: j.Entity | undefined
    while ((client = clientsClosed.pop()) !== undefined) {
      world.delete(client)
    }
  })
  .use(serverPlugin)

wss.on("connection", socket => {
  app.world.getResource(SocketsOpened).push(socket)
})

http.listen(8080)

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
}, 1000 / 60)
