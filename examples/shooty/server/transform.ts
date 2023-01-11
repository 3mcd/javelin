import {value} from "@javelin/ecs"

export interface Transform {
  x: number
  y: number
}

export let Transform = value<Transform>({x: "f32", y: "f32"})
