import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {createServer} from "http"
import {WebSocketServer} from "ws"
import {Input, model, Position, Velocity} from "./model.js"
import {playerPlugin} from "./player.js"

let http = createServer()
let wss = new WebSocketServer({server: http})

let Kinetic = j.type(Position, Velocity)
let kineticPresence = jn.presence(Kinetic, (_entity, subject) =>
  subject % 3 === 0 ? 100 : 10,
)
let kineticInterest = jn.interest(Kinetic, (_entity, subject) =>
  subject % 2 === 0 ? 100 : 10,
)

let app = j
  .app()
  .addResource(jn.NetworkModel, model)
  .addResource(jn.CommandValidator, (entity, commandType, command) => {
    switch (commandType) {
      case Input:
        // (validate command using client entity)
        return true
    }
    return false
  })
  .addInitSystem(world => {
    world.create(Kinetic)
  })
  .use(playerPlugin)
  .use(jn.serverPlugin)

wss.on("connection", socket => {
  let client = app.world.create()
  let clientTransport = jn.makeWebsocketTransport(
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
CALL OF
 ____  _   _  ___   ___ _______   __
/ ___|| | | |/ _ \\ / _ \\_   _\\ \\ / /
\\___ \\| |_| | | | | | | || |  \\ V / 
 ___) |  _  | |_| | |_| || |   | |  
|____/|_| |_|\\___/ \\___/ |_|   |_|  
`)

console.log("PORT=8080")

setInterval(() => {
  app.step()
}, 1000 / 60)
