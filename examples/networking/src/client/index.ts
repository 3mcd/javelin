import { createStorage, isComponentOf } from "@javelin/ecs"
import {
  createMessageHandler,
  NetworkMessage,
  NetworkMessageType,
} from "@javelin/net"
import { decode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { Position } from "../common/components"
import { ConnectionType, System } from "../common/types"
import { PositionBuffer } from "./components/position_buffer"
import { app, framerate, updateBytesTransferred } from "./graphics"
import { interpolate, render } from "./systems"
import { uuidv4 } from "./uuid"

const udp = new Client({
  url: `ws://${window.location.hostname}:8000`,
})
const storage = createStorage()
const messages: ArrayBuffer[] = []
const messageHandler = createMessageHandler(storage)
const systems: System[] = [interpolate, render]

storage.registerComponentFactory(PositionBuffer)

function handleMessage(message: NetworkMessage) {
  messageHandler.applyMessage(message)

  switch (message[0]) {
    case NetworkMessageType.Create: {
      const entityComponents = message[1]
      // Each remote transform is assigned a PositionBuffer
      for (let i = 0; i < entityComponents.length; i++) {
        const position = entityComponents[i].find(c => c._t === Position.type)

        if (!position) continue

        storage.insert(
          messageHandler.remoteToLocal.get(position._e)!,
          PositionBuffer.create(),
        )
      }
      break
    }
    case NetworkMessageType.Update: {
      const components = message[1]

      for (let i = 0; i < components.length; i++) {
        const component = components[i]

        if (isComponentOf(component, Position)) {
          const entity = messageHandler.remoteToLocal.get(component._e)

          if (!entity) continue

          const buffer = storage.findComponent(entity, PositionBuffer)

          buffer.updates.push([Date.now(), component.x, component.y])
        }
      }
      break
    }
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

  for (let i = 0; i < systems.length; i++) {
    systems[i](storage, deltaTime)
  }

  previousTime = time
  requestAnimationFrame(loop)
  tick++
}

async function main() {
  const sessionId = localStorage.getItem("sessionId") || uuidv4()
  const reliable = await udp.connect({
    binaryType: "arraybuffer",
    metadata: {
      sessionId,
      connectionType: ConnectionType.Reliable,
    },
    UNSAFE_ordered: true,
  })
  const unreliable = await udp.connect({
    binaryType: "arraybuffer",
    metadata: {
      sessionId,
      connectionType: ConnectionType.Unreliable,
    },
  })
  const handleMessage = (message: any) => messages.unshift(message)

  reliable.messages.subscribe(handleMessage)
  unreliable.messages.subscribe(handleMessage)

  localStorage.setItem("sessionId", sessionId)

  loop()
}

main()
