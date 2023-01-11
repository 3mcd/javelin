import {component} from "@javelin/ecs"

type Box = {
  x: number
  y: number
}

export let Box = component<Box>({x: "f32", y: "f32"})
