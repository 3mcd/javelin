import { World } from "@javelin/ecs"
import { SerializedComponentType } from "@javelin/net"

export type WorldConfig = {
  name: string
  world: World
  model: SerializedComponentType[]
}
