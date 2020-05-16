import { ComponentOf } from "@javelin/ecs"
import { Wormhole } from "../components"

export const calcWormholeHorizon = ({ radius }: ComponentOf<typeof Wormhole>) =>
  radius / 10
