import {
  createAddedFilter,
  Component,
  createQuery,
  createStorage,
  createTagFilter,
  mutableEmpty,
} from "@javelin/ecs"
import { createMessageProducer, protocol } from "@javelin/net"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import { encode } from "@msgpack/msgpack"
import { Server } from "@web-udp/server"
import { createServer } from "http"
import { Position } from "../common/components"
import { ConnectionType, System } from "../common/types"
import { Sleep, Velocity } from "./components"
import { createJunk } from "./entities"
import { physics, spawn } from "./systems"
import { Tags } from "./tags"
import { Client, ConnectionMetadata } from "./types"

const PORT = 8000
const TICK_RATE = 60

const server = createServer()
const udp = new Server({ server })
const storage = createStorage()
const producer = createMessageProducer({
  components: [{ type: Position, priority: 1 }],
  unreliableSendRate: 20,
  maxUpdateSize: 1500,
})
const removed = createTagFilter(Tags.Removing)
const clients: Client[] = []
const systems: System[] = [spawn, physics]

storage.registerComponentFactory(Position)
storage.registerComponentFactory(Velocity)
storage.registerComponentFactory(Sleep)

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
    for (const m of producer.all(storage)) {
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

const loop = createHrtimeLoop(tickRateMs, clock => {
  const time = clock.now

  for (let i = 0; i < systems.length; i++) {
    systems[i](storage, clock.dt)
  }

  const created = producer.added(storage)
  const changed = producer.changed(storage)
  const updated = producer.unreliable(storage)

  // for (const [p] of queryAll.run(storage, removed)) {
  //   storage.destroy(p._e)
  //   payloadRemoved.push(p._e)
  // }

  const messageCreated = created.length > 0 ? encode(created) : null
  const messageChanged = changed.length > 0 ? encode(changed) : null
  // const messageRemoved = encode(protocol.remove(payloadRemoved))

  for (let i = 0; i < clients.length; i++) {
    const { reliable, unreliable } = clients[i]
    if (messageCreated) reliable?.send(messageCreated)
    if (messageChanged) reliable?.send(messageChanged)
    // if (messageRemoved) reliable?.send(messageRemoved)

    unreliable?.send(encode(updated.next({}).value))
  }

  updated.return()

  mutableEmpty(payloadRemoved)
})

loop.start()

for (let i = 0; i < 1000; i++) {
  createJunk(storage)
}

server.listen(PORT)
