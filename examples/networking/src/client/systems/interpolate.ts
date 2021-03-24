import { onAttach, query, World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { RenderTransform } from "../components/position_buffer"

const queries = {
  positions: query(Position),
  renderTransforms: query(RenderTransform),
}

let SEND_RATE = 20

export function interpolate(world: World) {
  const time = Date.now()
  const renderTime = time - 1000 / SEND_RATE

  onAttach(Position).forEach(entity => {
    world.attach(entity, world.component(RenderTransform))
  })

  queries.positions.forEach((entity, [position]) => {
    if (!world.isComponentChanged(position)) {
      return
    }
    const buffer = world.tryGet(entity, RenderTransform)
    if (buffer) {
      const update = [time, position.x, position.y]
      buffer.updates.push(update)
    }
  })

  queries.renderTransforms.forEach((entity, [rt]) => {
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
      const mutRenderTransform = world.getObserved(rt)

      // Interpolate position.
      mutRenderTransform.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      mutRenderTransform.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
    }
  })
}
