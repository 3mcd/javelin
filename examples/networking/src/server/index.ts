import { createDevtoolMessageProducer } from "@javelin/devtool"
import { createWorld } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import {
  createMessageHandler,
  createMessageProducer,
  JavelinMessage,
  protocol,
  setUpdateMetadata,
} from "@javelin/net"
import { decode, encode } from "@msgpack/msgpack"
import { Connection } from "@web-udp/client"
import { Server } from "@web-udp/server"
import { createServer } from "http"
import { Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { Sleep, Velocity } from "./components"
import { createJunk } from "./entities"
import { physics, spawn } from "./systems"
import { Client, ConnectionMetadata, DevtoolMetadata } from "./types"

const PORT = 8000
const TICK_RATE = 60

const server = createServer()
const udp = new Server({ server })
const world = createWorld({
  systems: [spawn, physics],
  componentFactories: [Position, Velocity, Sleep],
})
const devtoolMessageHandler = createMessageHandler({ world })

const clientMessageProducer = createMessageProducer({
  world,
  components: [{ type: Position, priority: 1 }],
  updateInterval: (1 / 20) * 1000,
  updateSize: 1000,
})
const devtoolMessageProducer = createDevtoolMessageProducer(world)
const clients: Client[] = []
const devtools: Connection[] = []

function isDevtoolMetadata(obj: any): obj is DevtoolMetadata {
  return obj.isDevtool === true
}

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

function registerDevtool(connection: Connection) {
  setTimeout(() => {
    const model = protocol.model(world)
    const initial = devtoolMessageProducer.getInitialMessages()

    devtools.push(connection)
    connection.send(encode([...initial, model]))
  }, 250)
  connection.messages.subscribe(data => {
    devtoolMessageHandler.applyMessage(decode(data) as JavelinMessage)
  })
  connection.closed.subscribe(() => {
    devtools.splice(devtools.indexOf(connection), 1)
  })
}

function sendDevtoolMessages() {
  const messages = devtoolMessageProducer.getReliableMessages()

  if (messages.length === 0) {
    return
  }

  const encoded = encode(messages)

  for (let i = 0; i < devtools.length; i++) {
    devtools[i]?.send(encoded)
  }
}

function sendClientMessages() {
  const reliable = encode(clientMessageProducer.getReliableMessages())
  const unreliable = clientMessageProducer.getUnreliableMessages()

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    const update = unreliable[i]

    client.reliable?.send(reliable)

    if (update) {
      const updateWithMetadata = setUpdateMetadata(update, {})
      client.unreliable?.send(encode([updateWithMetadata]))
    }
  }
}

udp.connections.subscribe(connection => {
  if (isDevtoolMetadata(connection.metadata)) {
    registerDevtool(connection)
    return
  }

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
    setTimeout(() => {
      connection.send(encode(clientMessageProducer.getInitialMessages()))
    }, 250)
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
  sendDevtoolMessages()
}

const loop = createHrtimeLoop(tickRateMs, clock => tick(clock.dt))
loop.start()

for (let i = 0; i < 100; i++) {
  createJunk(world)
}

server.listen(PORT)
