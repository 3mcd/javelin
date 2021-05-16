import { createWorld } from "@javelin/ecs"
import { sysInterpolate } from "./sys_interpolate"

export const world = createWorld({
  systems: [sysInterpolate],
})
