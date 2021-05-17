import { createWorld } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { sysNet } from "./sys_net"
import { sysPhysics } from "./sys_physics"
import { sysSwap } from "./sys_swap"

export const world = createWorld<Clock>({
  systems: [sysNet, sysPhysics, sysSwap],
})
