import { createWorld } from "@javelin/ecs"
import { createMessageHandler, JavelinMessage } from "@javelin/net"
import { decode } from "@msgpack/msgpack"
import { Client } from "@web-udp/client"
import { ConnectionOptions } from "@web-udp/client/lib/provider"
import { Position, Red } from "../common/components"
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
  componentFactories: [Position, RenderTransform, Red],
})

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
  const connectionReliable = await udp.connect(reliableOptions)
  const connectionUnreliable = await udp.connect(unreliableOptions)

  connectionReliable.messages.subscribe(data =>
    messageHandler.push(decode(data) as JavelinMessage),
  )
  connectionUnreliable.messages.subscribe(data =>
    messageHandler.push(decode(data) as JavelinMessage),
  )

  loop()
}

main()
