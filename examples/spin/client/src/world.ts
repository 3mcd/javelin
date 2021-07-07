import {
  Entity,
  arrayOf,
  component,
  ComponentOf,
  createEffect,
  createQuery,
  createWorld,
  number,
  useInterval,
  useMonitor,
  useRef,
} from "@javelin/ecs"
import { createMessageHandler } from "@javelin/net"
import { Client } from "@web-udp/client"
import { Big, Shell, Transform } from "../../server/components"
import { CanvasRef } from "./Canvas"
import { createStackPool } from "./pool"

type WorldTickData = CanvasRef | null

const Camera = {
  x: number,
  y: number,
}
const Interpolate = {
  x: number,
  y: number,
  buffer: arrayOf(arrayOf(number)),
  adaptiveSendRate: number,
  lastUpdateTime: number,
}
export const shells = createQuery(Shell, Interpolate)
export const transforms = createQuery(Transform)
export const interpolates = createQuery(Transform, Interpolate)

const interpBufferPool = createStackPool<number[]>(
  () => [],
  i => {
    i.length = 0
    return i
  },
  1000,
)

const interpBufferInsert = (
  x: number,
  y: number,
  ip: ComponentOf<typeof Interpolate>,
) => {
  const item = interpBufferPool.retain()
  item[0] = performance.now()
  item[1] = x
  item[2] = y
  ip.buffer.push(item)
  return item
}

const getShellColor = (s: number) => {
  const v = (16 - s * 2).toString(16)
  return `#${v}${v}${v}`
}

export const useNet = createEffect(
  world => {
    const state = { bytes: 0 }
    const client = new Client({
      url: `${window.location.hostname}:8000`,
    })
    const handler = createMessageHandler(world)

    client.connect().then(c =>
      c.messages.subscribe(message => {
        state.bytes += message.byteLength
        handler.push(message)
      }),
    )

    return () => {
      handler.system()
      return Object.assign(state, handler.useInfo())
    }
  },
  { shared: true },
)

export const world = createWorld<WorldTickData>()

world.addSystem(({ attach }) => {
  const { updated } = useNet()
  const now = performance.now()
  const bufferTime = now - 1000

  useMonitor(transforms, (e, [{ x, y }]) =>
    attach(e, component(Interpolate, { x, y })),
  )

  interpolates((e, [{ x, y }, ip]) => {
    const { buffer } = ip

    if (updated.has(e)) {
      interpBufferInsert(x, y, ip)
      ip.adaptiveSendRate = (now - bufferTime) / 1000
    }
    const renderTime = bufferTime / ip.adaptiveSendRate

    while (buffer.length >= 2 && buffer[1][0] <= renderTime) {
      const item = buffer.shift()
      if (item) {
        interpBufferPool.release(item)
      }
    }

    if (
      buffer.length >= 2 &&
      buffer[0][0] <= renderTime &&
      renderTime <= buffer[1][0]
    ) {
      const [[t0, x0, y0], [t1, x1, y1]] = buffer
      ip.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      ip.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
    }
  })
})

world.addSystem(world => {
  const { create, attachImmediate, latestTickData: canvas } = world
  const net = useNet()
  const rate = useRef(0)
  const update = useInterval(1000)
  const cameraEntity = useRef<Entity | -1>(-1)

  if (update) {
    rate.value = net.bytes / 1000
    net.bytes = 0
  }

  if (cameraEntity.value === -1) {
    cameraEntity.value = create()
    attachImmediate(cameraEntity.value, [component(Camera)])
  }

  if (!(canvas && canvas.context)) {
    return
  }

  const { context } = canvas
  const camera = world.get(cameraEntity.value, Camera)
  const offsetX = camera.x - canvas.width / 2
  const offsetY = camera.y - canvas.height / 2

  context.clearRect(0, 0, canvas.width, canvas.height)

  shells((e, [s, { x, y }]) => {
    const size = world.has(e, Big) ? 3 : 1
    context.fillStyle = getShellColor(s.value as number)
    context.fillRect(x - offsetX, y - offsetY, size, size)
  })

  context.textAlign = "center"
  context.font = "12px SF Mono, Consolas, Courier New, monospace"
  context.fillStyle = "#fff"
  context.fillText(`${Math.floor(rate.value)} kb/s`, -offsetX, -offsetY + 4)
})
