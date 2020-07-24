import { committed, query, select } from "@javelin/ecs"
import { Position, Velocity, Wormhole } from "./components"

export const wormholes = query(select(Position, Wormhole))
export const junk = query(select(Position, Velocity), committed)
