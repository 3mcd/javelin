import { createWorld } from "@javelin/ecs"
import { sys_interpolate } from "./sys_interpolate"

export const world = createWorld({
  systems: [sys_interpolate],
})
