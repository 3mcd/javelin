import { createWorld, WorldOpType } from "@javelin/ecs"
import {
  createMessageHandler,
  JavelinMessage,
  JavelinMessageType,
} from "@javelin/net"
import { decode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { ConnectionOptions } from "@web-udp/client/lib/provider"
import { Position, Color } from "../common/components"
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
  componentTypes: [Position, RenderTransform, Color],
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

async function main() {
  const connectionReliable = await udp.connect(reliableOptions)
  const connectionUnreliable = await udp.connect(unreliableOptions)

  connectionReliable.messages.subscribe(data => {
    const message = decode(data) as JavelinMessage
    messageHandler.push(message)
  })
  connectionUnreliable.messages.subscribe(data => {
    const message = decode(data) as JavelinMessage
    messageHandler.push(message)
  })

  loop()
}

main()
