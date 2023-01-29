import * as j from "@javelin/ecs"

export interface Transform {
  x: number
  y: number
}

export let Transform = j.value<Transform>({x: "f32", y: "f32"})
