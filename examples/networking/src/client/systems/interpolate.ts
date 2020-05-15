import { createQuery, World } from "@javelin/ecs"
import { PositionBuffer } from "../components/position_buffer"

const buffers = createQuery(PositionBuffer)

let adaptiveSendRate = 20

export function interpolate(dt: number, world: World) {
  const time = Date.now()
  const renderTime = time - 1000 / 1

  for (let [buffer] of world.query(buffers)) {
    const b = world.mut(buffer)
    // Drop older positions.
    while (b.updates.length >= 2 && b.updates[1][0] <= renderTime) {
      b.updates.shift()
    }

    if (
      b.updates.length >= 2 &&
      b.updates[0][0] <= renderTime &&
      renderTime <= b.updates[1][0]
    ) {
      const [[t0, x0, y0], [t1, x1, y1]] = b.updates

      // Interpolate position.
      b.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      b.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
      adaptiveSendRate = (1000 / (t1 - t0) + adaptiveSendRate) / 2
    }
  }
}
