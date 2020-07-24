import { query, select, World, created, changed, committed } from "@javelin/ecs"
import { RenderTransform } from "../components/position_buffer"
import { Position } from "../../common/components"
import { render } from "./render"

const positionsCreated = query(select(Position), created)
const positionsChanged = query(select(Position), changed, committed)
const renderTransforms = query(select(RenderTransform))

let adaptiveSendRate = 20

export function interpolate(world: World, dt: number) {
  const time = Date.now()
  const renderTime = time - 1000 / adaptiveSendRate

  for (const [{ _e: entity }] of positionsCreated(world)) {
    world.insert(entity, [RenderTransform.create()])
  }

  for (const [{ _e: entity, x, y }] of positionsChanged(world)) {
    const buffer = world.getComponent(entity, RenderTransform)
    const update = [Date.now(), x, y]

    buffer.updates.push(update)
  }

  for (const [renderTransform] of renderTransforms(world)) {
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
      const mutRenderTransform = world.mut(renderTransform)

      // Interpolate position.
      mutRenderTransform.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
      mutRenderTransform.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
      adaptiveSendRate = (1000 / (t1 - t0) + adaptiveSendRate) / 2
    }
  }
}
