import { ComponentOf, createWorld, isComponentOf } from "@javelin/ecs"
import {
  createMessageHandler,
  NetworkMessage,
  NetworkMessageType,
} from "@javelin/net"
import { decode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { PositionBuffer } from "./components/position_buffer"
import { app, framerate, updateBytesTransferred } from "./graphics"
import { interpolate, render } from "./systems"
import { uuidv4 } from "./uuid"
import { ConnectionOptions } from "@web-udp/client/lib/provider"

const udp = new Client({
  url: `ws://${window.location.hostname}:8000`,
})
const world = createWorld([interpolate, render])
const messages: ArrayBuffer[] = []
const messageHandler = createMessageHandler(world)

world.registerComponentFactory(Position)
world.registerComponentFactory(PositionBuffer)

function createPositionBuffer(entity: number) {
  const local = messageHandler.remoteToLocal.get(entity)

  if (typeof local !== "number") {
    throw new Error("Entity was not created.")
  }

  world.insert(local, PositionBuffer.create())
}

function updatePositionBuffer(component: ComponentOf<typeof Position>) {
  const entity = messageHandler.remoteToLocal.get(component._e)

  if (!entity || world.isEphemeral(entity)) {
    return
  }

  const buffer = world.storage.findComponent(entity, PositionBuffer)
  const update = [Date.now(), component.x, component.y]

  buffer.updates.push(update)
}

function handleMessage(message: NetworkMessage) {
  messageHandler.applyMessage(message)

  switch (message[0]) {
    case NetworkMessageType.Create:
      message[1].forEach(component => {
        if (isComponentOf(component, Position)) {
          createPositionBuffer(component._e)
        }
      })
      break
    case NetworkMessageType.Update:
      message[1].forEach(component => {
        if (isComponentOf(component, Position)) {
          updatePositionBuffer(component)
        }
      })
      break
  }
}

let tick = 0
let previousTime = 0

function loop(time = 0) {
  const deltaTime = time - (previousTime || time)
  let message

  if (tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  while ((message = messages.pop())) {
    updateBytesTransferred(message.byteLength)
    handleMessage(decode(message) as NetworkMessage)
  }

  world.tick(deltaTime)

  previousTime = time
  requestAnimationFrame(loop)
  tick++
}

const sessionId = localStorage.getItem("sessionId") || uuidv4()
localStorage.setItem("sessionId", sessionId)

const reliableOptions: ConnectionOptions = {
  binaryType: "arraybuffer",
  metadata: {
    sessionId,
    connectionType: ConnectionType.Reliable,
  },
  UNSAFE_ordered: true,
}

const unreliableOptions: ConnectionOptions = {
  binaryType: "arraybuffer",
  metadata: {
    sessionId,
    connectionType: ConnectionType.Unreliable,
  },
}

async function main() {
  const reliable = await udp.connect(reliableOptions)
  const unreliable = await udp.connect(unreliableOptions)
  const handleMessage = (message: any) => messages.unshift(message)

  reliable.messages.subscribe(handleMessage)
  unreliable.messages.subscribe(handleMessage)

  loop()
}

main()
