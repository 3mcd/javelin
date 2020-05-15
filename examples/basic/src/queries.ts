import { createCommittedFilter, createQuery } from "@javelin/ecs"
import { Position, Velocity, Wormhole } from "./components"

export const wormholes = createQuery(Position, Wormhole)
export const junk = createQuery(Position, Velocity).filter(
  createCommittedFilter(),
)
