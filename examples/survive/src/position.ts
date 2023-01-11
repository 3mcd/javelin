import {component} from "@javelin/ecs"

type Position = {
  x: number
  y: number
}

export let Position = component<Position>({x: "f32", y: "f32"})
