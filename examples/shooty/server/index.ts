import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {createServer} from "http"
import {WebSocketServer} from "ws"
import {networkModel, Position, Velocity} from "./model.js"

let http = createServer()
let wss = new WebSocketServer({server: http})

let Kinetic = j.type(Position, Velocity)

let app = j
  .app()
  .addResource(jn.NetworkModel, networkModel)
  .addSystem(
    world => {
      let tick = world.getResource(j.Tick)
      let v = {x: Math.random(), y: -tick / 5}
      world.create(Kinetic, undefined, v)
    },
    null,
    world => {
      let tick = world.getResource(j.Tick)
      return tick % 5 === 0 && tick < 500
    },
  )
  .addSystem(world => {
    world.of(Kinetic).each((_, p, v) => {
      p.x += v.x
      p.y += v.y
    })
  })
  .use(jn.serverPlugin)

wss.on("connection", socket => {
  let client = app.world.create()
  let clientTransport = new jn.WebsocketTransport(
    socket as unknown as globalThis.WebSocket,
  )
  let clientKineticPresence = jn.presence(client, Kinetic, (_, subject) =>
    subject % 2 === 0 ? 100 : 10,
  )
  let clientAwareness = jn.awareness(clientKineticPresence)
  app.world.add(client, jn.Client, clientTransport, clientAwareness)
  socket.on("close", () => {
    app.world.delete(client)
  })
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
