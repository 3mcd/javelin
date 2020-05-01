import {
  createAddedFilter,
  Component,
  createQuery,
  createStorage,
  createTagFilter,
  mutableEmpty,
} from "@javelin/ecs"
import { createPriorityAccumulator, protocol } from "@javelin/net"
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
const SEND_RATE = 20
const MAX_UPDATE_SIZE = 1500

const server = createServer()
const udp = new Server({ server })
const storage = createStorage()
const config = [{ componentType: Position, priority: 1 }]
const unreliable = config.filter(c => c.priority > 0)
const priorities = createPriorityAccumulator(
  new Map(unreliable.map(c => [c.componentType.type, c.priority])),
)
const queryAll = createQuery(...config.map(c => c.componentType))
const queryUnreliable = createQuery(...unreliable.map(c => c.componentType))
const added = createAddedFilter()
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

function getInitialCreatedMessage() {
  const created: Component[][] = []

  for (const results of queryAll.run(storage)) {
    created.push(results.slice())
  }

  const message = encode(protocol.insert(created))

  return message
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
    client.reliable.send(getInitialCreatedMessage())
  } else {
    client.unreliable = connection
  }

  connection.closed.subscribe(removeClient)
  connection.errors.subscribe(console.error)
})

const tickRateMs = 1000 / TICK_RATE
const sendRateMs = 1000 / SEND_RATE

let previousSendTime = BigInt(0)

const payloadCreated: Component[][] = []
const payloadUpdated: Component[] = []
const payloadRemoved: number[] = []

const loop = createHrtimeLoop(tickRateMs, clock => {
  const time = clock.now

  for (let i = 0; i < systems.length; i++) {
    systems[i](storage, clock.dt)
  }

  for (const results of queryUnreliable.run(storage)) {
    for (let i = 0; i < unreliable.length; i++) {
      priorities.update(results[i])
    }
  }

  for (const [p] of queryAll.run(storage, removed)) {
    storage.destroy(p._e)
    payloadRemoved.push(p._e)
  }

  for (const results of queryAll.run(storage, added)) {
    payloadCreated.push(results.slice())
  }

  if (time - previousSendTime >= sendRateMs) {
    for (const component of priorities) {
      payloadUpdated.push(component)
      if (payloadUpdated.length >= MAX_UPDATE_SIZE) {
        break
      }
    }
    previousSendTime = time
  }

  const messageCreated = encode(protocol.insert(payloadCreated))
  const messageRemoved = encode(protocol.remove(payloadRemoved))

  for (let i = 0; i < clients.length; i++) {
    const { reliable, unreliable } = clients[i]
    if (payloadCreated.length > 0) reliable?.send(messageCreated)
    if (payloadRemoved.length > 0) reliable?.send(messageRemoved)
    if (payloadUpdated.length > 0)
      unreliable?.send(encode(protocol.update(payloadUpdated, {})))
  }

  mutableEmpty(payloadUpdated)
  mutableEmpty(payloadCreated)
  mutableEmpty(payloadRemoved)
})

loop.start()

for (let i = 0; i < 1000; i++) {
  createJunk(storage)
}

server.listen(PORT)
