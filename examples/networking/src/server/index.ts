import { createWorld } from "@javelin/ecs"
import { createHrtimeLoop } from "@javelin/hrtime-loop"
import {
  createMessageHandler,
  createMessageProducer,
  JavelinMessage,
  protocol,
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
const world = createWorld([spawn, physics])
const handler = createMessageHandler(world)

world.registerComponentFactory(Position)
world.registerComponentFactory(Velocity)
world.registerComponentFactory(Sleep)

const clientMessageProducer = createMessageProducer({
  world,
  components: [{ type: Position, priority: 1 }],
  updateInterval: (1 / 20) * 1000,
  updateSize: 1000,
})
const devtoolMessageProducer = createMessageProducer({
  world,
  components: world.registeredComponentFactories.map(type => ({ type })),
  updateInterval: 1000,
  updateSize: 1000,
})
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
  devtools.push(connection)
  setTimeout(() => connection.send(encode(protocol.model(world))), 250)
  connection.messages.subscribe(data => {
    handler.applyMessage(decode(data) as JavelinMessage)
  })
  connection.closed.subscribe(() => {
    devtools.splice(devtools.indexOf(connection), 1)
  })
}

function sendDevtoolMessages() {
  const reliable = devtoolMessageProducer.getReliableMessages()

  for (let i = 0; i < devtools.length; i++) {
    const devtool = devtools[i]

    for (const message of reliable) {
      devtool?.send(encode(message))
    }
  }
}

function sendClientMessages() {
  const metadata = clients.map(() => ({}))
  const reliable = clientMessageProducer.getReliableMessages()
  const unreliable = clientMessageProducer.getUnreliableMessages(metadata)

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]

    for (const message of reliable) {
      client.reliable?.send(encode(message))
    }

    client.unreliable?.send(encode(unreliable[i]))
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
    client.reliable.send(encode(clientMessageProducer.getInitialMessages()))
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

for (let i = 0; i < 10; i++) {
  createJunk(world)
}

server.listen(PORT)
