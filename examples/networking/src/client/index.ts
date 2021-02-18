import { createWorld, array } from "@javelin/ecs"
import { createMessageHandler, JavelinMessage } from "@javelin/net"
import { decode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { ConnectionOptions } from "@web-udp/client/lib/provider"
import { Color, Position } from "../common/components"
import { ConnectionType } from "../common/types"
import { RenderTransform } from "./components/position_buffer"
import { app, framerate } from "./graphics"
import { interpolate, render } from "./systems"
import { uuidv4 } from "./uuid"

const udp = new Client({
  url: `ws://${window.location.hostname}:8000`,
})
const messageHandler = createMessageHandler()
const world = createWorld({
  systems: [messageHandler.system, interpolate, render],
})

;(window as any).world = world

let tick = 0
let previousTime = 0

function loop(time = 0) {
  const deltaTime = time - (previousTime || time)

  if (tick % 60 === 0) {
    framerate.text = `${app.ticker.FPS.toFixed(0)}`
  }

  world.tick(deltaTime)

  previousTime = time
  requestAnimationFrame(loop)
  tick++
}

const sessionId = uuidv4()

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

const LOG_BANDWIDTH_INTERVAL_MS = 1000

let prevTransferLogTime = 0
let bytes = 0

function logDataTransferRate(arrayBuffer: ArrayBuffer) {
  const now = performance.now()

  bytes += arrayBuffer.byteLength

  if (now - prevTransferLogTime >= LOG_BANDWIDTH_INTERVAL_MS) {
    console.log(`${bytes / 1000} kb/s`, decode(arrayBuffer))
    prevTransferLogTime = now
    bytes = 0
  }
}

async function main() {
  const connectionReliable = await udp.connect(reliableOptions)
  const connectionUnreliable = await udp.connect(unreliableOptions)

  connectionReliable.messages.subscribe(data => {
    const message = decode(data) as JavelinMessage
    messageHandler.push(message)
    logDataTransferRate(data)
  })
  connectionUnreliable.messages.subscribe(data => {
    const message = decode(data) as JavelinMessage
    messageHandler.push(message)
    logDataTransferRate(data)
  })

  loop()
}

main()
