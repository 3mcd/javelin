import { attached, changed, query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"

const queries = {
  attached: query(attached(Position)),
  changed: query(changed(Position)),
  renderTransforms: query(RenderTransform),
}

let SEND_RATE = 20

export function interpolate(world: World) {
  const time = Date.now()
  const renderTime = time - 1000 / SEND_RATE

  for (const [e] of queries.attached) {
    world.attach(e, world.component(RenderTransform))
  }

  for (const [e, { x, y }] of queries.changed) {
    const buffer = world.tryGetComponent(e, RenderTransform)

    if (buffer) {
      const update = [time, x, y]

      buffer.updates.push(update)
    }
  }

  for (const [, rt] of queries.renderTransforms) {
    const { updates } = rt

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
      const mutRenderTransform = world.getObservedComponent(rt)

      // Interpolate position.
      mutRenderTransform.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      mutRenderTransform.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
    }
  }
}
