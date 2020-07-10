import { createDevtool } from "@javelin/devtool"
import { ComponentOf, createWorld, isComponentOf } from "@javelin/ecs"
import {
  createMessageHandler,
  JavelinMessage,
  JavelinMessageType,
} from "@javelin/net"
import { decode, encode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { ConnectionOptions } from "@web-udp/client/lib/provider"
import { Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { PositionBuffer } from "./components/position_buffer"
import { app, framerate, updateBytesTransferred } from "./graphics"
import { interpolate, render } from "./systems"
import { uuidv4 } from "./uuid"

const udp = new Client({
  url: `ws://${window.location.hostname}:8000`,
})
const world = createWorld({
  systems: [interpolate, render],
  componentFactories: [Position, PositionBuffer],
})
const localMessageHandler = createMessageHandler({ world })
const remoteWorld = createWorld()
const remoteMessageHandler = createMessageHandler({ world: remoteWorld })

function createPositionBuffer(entity: number) {
  const local = localMessageHandler.remoteToLocal.get(entity)

  if (typeof local !== "number") {
    throw new Error("Entity was not created.")
  }

  world.insert(local, PositionBuffer.create())
}

function updatePositionBuffer(component: ComponentOf<typeof Position>) {
  const entity = localMessageHandler.remoteToLocal.get(component._e)

  if (!entity) {
    return
  }

  const buffer = world.storage.findComponent(entity, PositionBuffer)
  const update = [Date.now(), component.x, component.y]

  buffer.updates.push(update)
}

function handleMessage(data: ArrayBuffer) {
  const messages = decode(data) as JavelinMessage[]

  updateBytesTransferred(data.byteLength)

  for (const message of messages) {
    localMessageHandler.applyMessage(message)

    switch (message[0]) {
      case JavelinMessageType.Create:
        message[1].forEach(component => {
          if (isComponentOf(component, Position)) {
            createPositionBuffer(component._e)
          }
        })
        break
      case JavelinMessageType.Update:
        message[1].forEach(component => {
          if (isComponentOf(component, Position)) {
            updatePositionBuffer(component)
          }
        })
        break
    }
  }
}

let tick = 0
let previousTime = 0

function loop(time = 0) {
  const deltaTime = time - (previousTime || time)

  if (tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  world.tick(deltaTime)
  remoteWorld.tick(undefined)

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

const devtoolOptions: ConnectionOptions = {
  binaryType: "arraybuffer",
  metadata: {
    isDevtool: true,
  },
  UNSAFE_ordered: true,
}

async function main() {
  const devtool = createDevtool({
    worlds: {
      local: world,
      remote: remoteWorld,
    },
    onMessage(w, message) {
      log.info(JSON.stringify(message))
      connectionDevtool.send(encode(message))
    },
  })
  const { log } = devtool.mount(document.getElementById("devtool")!)

  const connectionReliable = await udp.connect(reliableOptions)
  log.info("Reliable channel established")

  const connectionUnreliable = await udp.connect(unreliableOptions)
  log.info("Unreliable channel established")

  const connectionDevtool = await udp.connect(devtoolOptions)
  log.info("Devtools connected")

  function handleDevtoolMessage(data: any) {
    const messages = decode(data) as JavelinMessage[]

    for (const message of messages) {
      if (message[0] === JavelinMessageType.Model) {
        devtool.setModel(remoteWorld, message[1])
      } else {
        remoteMessageHandler.applyMessage(message)
      }
    }
  }

  connectionReliable.messages.subscribe(handleMessage)
  connectionUnreliable.messages.subscribe(handleMessage)
  connectionDevtool.messages.subscribe(handleDevtoolMessage)

  loop()
}

main()
