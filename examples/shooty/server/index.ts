import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {createServer} from "http"
import {WebSocketServer} from "ws"
import {Input, networkModel, Position, Velocity} from "./model.js"
import {movePlayerSystem} from "./player.js"

let http = createServer()
let wss = new WebSocketServer({server: http})

let Kinetic = j.type(Position, Velocity)
let kineticPresence = jn.presence(Kinetic, (_entity, subject) =>
  subject % 3 === 0 ? 100 : 10,
)
let kineticInterest = jn.snapshotInterest(Kinetic, (_entity, subject) =>
  subject % 2 === 0 ? 100 : 10,
)

let app = j
  .app()
  .addResource(jn.NetworkModel, networkModel)
  .addResource(jn.ClientCommandValidator, (entity, commandType, command) => {
    switch (commandType) {
      case Input:
        // TODO: get player entity
        // return command === entity
        return true
    }
    return false
  })
  .addInitSystem(world => {
    world.create(Kinetic)
  })
  .addSystem(movePlayerSystem)
  .use(jn.serverPlugin)

wss.on("connection", socket => {
  let client = app.world.create()
  let clientTransport = new jn.WebsocketTransport(
    socket as unknown as globalThis.WebSocket,
  )
  let clientAwareness = jn.awareness(kineticPresence, kineticInterest)
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
