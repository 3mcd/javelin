import { createQuery, World } from "@javelin/ecs"
import { PositionBuffer } from "../components/position_buffer"

const buffers = createQuery(PositionBuffer)

let adaptiveSendRate = 20

export function interpolate(dt: number, world: World) {
  const time = Date.now()
  const renderTime = time - 1000 / 1

  for (const [buffer] of world.query(buffers)) {
    // Drop older positions.
    while (buffer.updates.length >= 2 && buffer.updates[1][0] <= renderTime) {
      buffer.updates.shift()
    }

    if (
      buffer.updates.length >= 2 &&
      buffer.updates[0][0] <= renderTime &&
      renderTime <= buffer.updates[1][0]
    ) {
      const [[t0, x0, y0], [t1, x1, y1]] = buffer.updates

      // Interpolate position.
      buffer.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      buffer.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
      adaptiveSendRate = (1000 / (t1 - t0) + adaptiveSendRate) / 2
    }
  }
}
