import * as j from "@javelin/ecs"

type Box = {
  x: number
  y: number
}

export let Box = j.value<Box>({x: "f32", y: "f32"})
