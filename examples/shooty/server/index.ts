import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {createServer} from "http"
import {WebSocketServer} from "ws"
import {identityMessage} from "../shared/identity.js"
import {Input, model, Position, Velocity} from "../shared/model.js"
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

let Owns = j.relation()

let app = j
  .app(
    new Map([
      [
        j.FixedTimestepConfig,
        {
          terminationCondition: j.TerminationCondition.LastUndershoot,
        },
      ],
    ]),
  )
  .addResource(jn.NetworkModel, model)
  .addResource(jn.CommandValidator, (world, client, commandType, command) => {
    switch (commandType) {
      case Input: {
        let entity = (command as {entity: j.Entity}).entity
        return world.has(client, Owns(entity))
      }
    }
    return false
  })
  .addSystemToGroup(j.FixedGroup.EarlyUpdate, world => {
    let protocol = world.getResource(jn.Protocol)
    world.monitor(jn.Client).eachIncluded(client => {
      let clientTransport = world.get(client, jn.Transport)!
      let clientActor = world.create(Kinetic)
      let stream = jn.writeStream()
      protocol.encoder(identityMessage)(stream, clientActor)
      clientTransport.push(stream.bytes(), true)
      stream.destroy()
      world.add(client, Owns(clientActor))
    })
  })
  .addSystemToGroup(j.Group.Update, movePlayerSystem)
  .use(jn.serverPlugin)
  .use(app => {
    let protocol = app.getResource(jn.Protocol)!
    protocol.register(identityMessage, 99)
  })

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
