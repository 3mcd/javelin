import {value} from "@javelin/ecs"

type Position = {
  x: number
  y: number
}

export let Position = value<Position>({x: "f32", y: "f32"})
