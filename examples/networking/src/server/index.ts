import { createWorld, mutableEmpty } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
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
const producer = createMessageProducer({
  encode,
  components: [{ type: Position, priority: 1 }],
  unreliableSendRate: (1 / 20) * 1000,
  maxUpdateSize: 1000,
})
const clients: Client[] = []

world.registerComponentFactory(Position)
world.registerComponentFactory(Velocity)
world.registerComponentFactory(Sleep)

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
    client.reliable.send(encode(producer.all(world)))
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

  const created = producer.created(world)
  const changed = producer.changed(world)
  const updated = producer.unreliable(world)
  const destroyed = producer.destroyed(world)

  for (let i = 0; i < clients.length; i++) {
    const { reliable, unreliable } = clients[i]

    if (created) reliable?.send(created)
    if (changed) reliable?.send(changed)
    if (destroyed) reliable?.send(destroyed)

    const update = updated.next({}).value

    if (update) {
      unreliable?.send(encode(update))
    }
  }

  updated.return()

  mutableEmpty(payloadRemoved)
}

const loop = createHrtimeLoop(tickRateMs, clock => tick(clock.dt))
loop.start()

for (let i = 0; i < 10; i++) {
  createJunk(world)
}

server.listen(PORT)
