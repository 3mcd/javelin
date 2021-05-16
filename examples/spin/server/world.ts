import { createWorld } from "@javelin/ecs"
import { sysNet } from "./sys_net"
import { sys_physics } from "./sys_physics"
import { sysSwap } from "./sys_swap"

export const world = createWorld({
  systems: [sysNet, sys_physics, sysSwap],
})
