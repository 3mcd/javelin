import * as j from "@javelin/ecs"
import * as jn from "@javelin/net"
import {createServer} from "http"
import {WebSocketServer} from "ws"
import {identityMessage} from "../shared/identity.js"
import {Input, model, Position, Velocity} from "../shared/model.js"
import {movePlayerSystem} from "./player.js"

let http = createServer()
let wss = new WebSocketServer({server: http})

let distance = (ax: number, ay: number, bx: number, by: number) => {
  let dx = ax - bx
  let dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

let Kinetic = j.type(Position, Velocity)
let kineticPresence = jn.presence(Kinetic)
let kineticInterest = jn.snapshotInterest(Kinetic, (entity, subject, world) => {
  let actor = world.getRelatedEntity(entity, Owns)
  if (actor === subject) return 1
  let aPos = world.get(actor, Position)!
  let bPos = world.get(subject, Position)!
  return 1 / distance(aPos.x, aPos.y, bPos.x, bPos.y)
})

let Owns = j.relation()

let app = j
  .app()
  .addResource(jn.NetworkModel, model)
  .addResource(jn.CommandValidator, (world, client, commandType, command) => {
    switch (commandType) {
      case Input: {
        let {h, v, entity} = command as j.Value<typeof Input>
        if (!(world.exists(entity) && world.exists(client))) {
          return false
        }
        return (
          world.has(client, Owns(entity)) &&
          Math.abs(h) <= 1 &&
          Math.abs(v) <= 1
        )
      }
    }
    return false
  })
  .addSystemToGroup(j.FixedGroup.EarlyUpdate, world => {
    let protocol = world.getResource(jn.NetworkProtocol)
    world.monitor(jn.Client).eachIncluded(client => {
      let clientTransport = world.get(client, jn.Transport)!
      let clientActor = world.create(Kinetic)
      let stream = jn.writeStream()
      protocol.encoder(identityMessage)(stream, clientActor)
      clientTransport.push(stream.bytes(), true)
      stream.destroy()
      world.add(client, Owns(clientActor))
    })
    world.monitorImmediate(jn.Client).eachExcluded(client => {
      let clientActor = world.getRelatedEntity(client, Owns)
      world.delete(clientActor)
    })
  })
  .addSystemToGroup(j.FixedGroup.Update, movePlayerSystem)
  .use(jn.serverPlugin)
  .use(app => {
    let protocol = app.getResource(jn.NetworkProtocol)!
    protocol.register(identityMessage, 99)
  })

wss.on("connection", socket => {
  let client = app.world.create()
  let clientTransport = jn.websocketTransport(
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
