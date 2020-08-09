import { World } from "@javelin/ecs"
import { Position } from "../../common/components"
import { Sleep, Velocity } from "../components"

export function createJunk(world: World) {
  const { spawn, component } = world
  const vx = Math.random() * 50
  const vy = Math.random() * 50
  const entity = spawn(
    component(Position),
    component(Velocity, vx, vy),
    component(Sleep),
  )

  return entity
}
