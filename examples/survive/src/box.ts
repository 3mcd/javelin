import {value} from "@javelin/ecs"

type Box = {
  x: number
  y: number
}

export let Box = value<Box>({x: "f32", y: "f32"})
