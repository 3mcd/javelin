import { createWorld, mutableEmpty } from "@javelin/ecs"
import { createHrtimeLoop, Clock } from "@javelin/hrtime-loop"
import { createMessageProducer } from "@javelin/net"
import { encode } from "@msgpack/msgpack"
import { Server } from "@web-udp/server"
import { createServer } from "http"
import { Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { Sleep, Velocity } from "./components"
import { createJunk } from "./entities"
import { physics, spawn } from "./systems"
import { Client, ConnectionMetadata } from "./types"

const PORT = 8000
const TICK_RATE = 60

const server = createServer()
const udp = new Server({ server })
const world = createWorld([spawn, physics])
const messages = createMessageProducer({
  components: [{ type: Position, priority: 1 }],
  unreliableSendRate: (1 / 20) * 1000,
  maxUpdateSize: 1000,
})
const clients: Client[] = []

world.storage.registerComponentFactory(Position)
world.storage.registerComponentFactory(Velocity)
world.storage.registerComponentFactory(Sleep)

function isConnectionMetadata(obj: any): obj is ConnectionMetadata {
  return (
    Object.values(ConnectionType).includes(obj.connectionType) &&
    typeof obj.sessionId === "string"
  )
}

function findOrCreateClient(sessionId: string) {
  let client = clients.find(c => c.sessionId === sessionId)

  if (!client) {
    console.log(`Client ${sessionId} connected`)
    client = { sessionId }
    clients.push(client)
  }

  return client
}

udp.connections.subscribe(connection => {
  if (!isConnectionMetadata(connection.metadata)) {
    console.error("Invalid connection metadata.")
    return
  }

  const { connectionType, sessionId } = connection.metadata
  const client = findOrCreateClient(sessionId)
  const removeClient = () => {
    console.log(`Client ${sessionId} disconnected`)
    clients.splice(clients.indexOf(client), 1)
  }

  console.log(`Client ${sessionId} established ${connectionType} channel`)

  if (connectionType === ConnectionType.Reliable) {
    client.reliable = connection

    for (const m of messages.all(world)) {
      client.reliable.send(encode(m))
    }
  } else {
    client.unreliable = connection
  }

  connection.closed.subscribe(removeClient)
  connection.errors.subscribe(console.error)
})

const tickRateMs = 1000 / TICK_RATE
const payloadRemoved: number[] = []

const tick = (dt: number) => {
  world.tick(dt)

  const created = messages.created(world)
  const changed = messages.changed(world)
  const updated = messages.unreliable(world)
  const destroyed = messages.destroyed(world)

  const messageCreated = created.length > 0 ? created.map(m => encode(m)) : null
  const messageChanged = changed.length > 0 ? changed.map(m => encode(m)) : null
  const messageDestroyed =
    destroyed.length > 0 ? destroyed.map(m => encode(m)) : null

  for (let i = 0; i < clients.length; i++) {
    const { reliable, unreliable } = clients[i]

    if (messageCreated) messageCreated.forEach(m => reliable?.send(m))
    if (messageChanged) messageChanged.forEach(m => reliable?.send(m))
    if (messageDestroyed) messageDestroyed.forEach(m => reliable?.send(m))

    const update = updated.next({}).value

    if (update) {
      unreliable?.send(encode(update))
    }
  }

  updated.return()

  mutableEmpty(payloadRemoved)
}

// high-resolution game loop
const loop = createHrtimeLoop(tickRateMs, clock => tick(clock.dt))
loop.start()

//// setInterval game loop
// let previousTime = 0

// setInterval(() => {
//   const now = Date.now()
//   tick(now - previousTime)
//   previousTime = now
// }, tickRateMs)

for (let i = 0; i < 1000; i++) {
  createJunk(world)
}

server.listen(PORT)
