import {component} from "@javelin/ecs"

export interface Transform {
  x: number
  y: number
}

export let Transform = component<Transform>({x: "f32", y: "f32"})
