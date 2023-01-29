import * as j from "@javelin/ecs"

type Position = {
  x: number
  y: number
}

export let Position = j.value<Position>({x: "f32", y: "f32"})
