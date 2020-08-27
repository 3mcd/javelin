import { attached, changed, query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"

const positionsAttached = query(attached(Position))
const positionsChanged = query(changed(Position))
const renderTransforms = query(RenderTransform)

let SEND_RATE = 20

export function interpolate(world: World) {
  const time = Date.now()
  const renderTime = time - 1000 / SEND_RATE

  for (const [entity] of positionsAttached(world)) {
    world.attach(entity, world.component(RenderTransform))
  }

  for (const [entity, [{ x, y }]] of positionsChanged(world)) {
    const buffer = world.tryGetComponent(entity, RenderTransform)

    if (buffer) {
      const update = [time, x, y]

      buffer.updates.push(update)
    }
  }

  for (const [, [renderTransform]] of renderTransforms(world)) {
    const { updates } = renderTransform

    // Drop older positions.
    while (updates.length >= 2 && updates[1][0] <= renderTime) {
      updates.shift()
    }

    if (
      updates.length >= 2 &&
      updates[0][0] <= renderTime &&
      renderTime <= updates[1][0]
    ) {
      const [[t0, x0, y0], [t1, x1, y1]] = updates
      const mutRenderTransform = world.getMutableComponent(renderTransform)

      // Interpolate position.
      mutRenderTransform.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      mutRenderTransform.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
    }
  }
}
