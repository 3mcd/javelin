import { createWorld } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { createMessageProducer, setUpdateMetadata } from "@javelin/net"
import { encode } from "@msgpack/msgpack"
import { Server } from "@web-udp/server"
import { createServer } from "http"
import { Color, Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { Sleep, Velocity } from "./components"
import { createJunk } from "./entities"
import { cycleColor, physics, spawn } from "./systems"
import { Client, ConnectionMetadata } from "./types"

const PORT = 8000
const TICK_RATE = 60

const server = createServer()
const udp = new Server({ server })
const world = createWorld({
  systems: [spawn, physics, cycleColor],
})

const messageProducer = createMessageProducer({
  components: [{ type: Position, priority: 1 }, { type: Color }],
  updateInterval: (1 / 20) * 1000,
  updateSize: 1000,
})

const clients: Client[] = []

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
    client = { sessionId, initialized: false }
    clients.push(client)
  }

  return client
}

function sendClientMessages() {
  const reliable = messageProducer.getReliableMessages(world)
  const unreliable = messageProducer.getUnreliableMessages(world)

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]

    if (!client.initialized) {
      for (const message of messageProducer.getInitialMessages(world)) {
        client.reliable?.send(encode(message))
      }
      client.initialized = true
      continue
    }

    for (let j = 0; j < reliable.length; j++) {
      client.reliable?.send(encode(reliable[j]))
    }

    for (let j = 0; j < unreliable.length; j++) {
      client.unreliable?.send(encode(setUpdateMetadata(unreliable[j], {})))
    }
  }
}

udp.connections.subscribe(connection => {
  if (!isConnectionMetadata(connection.metadata)) {
    console.error("Invalid connection metadata.")
    return
  }

  const { connectionType, sessionId } = connection.metadata
  const client = findOrCreateClient(sessionId)
  const removeClient = () => {
    const index = clients.indexOf(client)

    if (index === -1) {
      return
    }

    console.log(`Client ${sessionId} disconnected`)
    clients.splice(clients.indexOf(client), 1)
  }

  console.log(`Client ${sessionId} established ${connectionType} channel`)

  if (connectionType === ConnectionType.Reliable) {
    client.reliable = connection
  } else {
    client.unreliable = connection
  }

  connection.closed.subscribe(removeClient)
  connection.errors.subscribe(console.error)
})

const tickRateMs = 1000 / TICK_RATE

function tick(dt: number) {
  world.tick(dt)
  sendClientMessages()
}

const loop = createHrtimeLoop(tickRateMs, clock => tick(clock.dt))
loop.start()

for (let i = 0; i < 20; i++) {
  createJunk(world)
}

server.listen(PORT)
