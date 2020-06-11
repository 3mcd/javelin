import { committed, createQuery, mut } from "@javelin/ecs"
import { Position, Velocity, Wormhole } from "./components"

export const wormholes = createQuery(Position, mut(Wormhole))
export const junk = createQuery(mut(Position), mut(Velocity)).filter(committed)
