import { createWorld } from "@javelin/ecs"
import { sys_net } from "./sys_net"
import { sys_physics } from "./sys_physics"
import { sys_swap } from "./sys_swap"

export const world = createWorld({
  systems: [sys_net, sys_physics, sys_swap],
})
