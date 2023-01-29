import * as j from "@javelin/ecs"

export interface Vector2 {
  x: number
  y: number
}

export let Position = j.value<Vector2>({x: "f32", y: "f32"})
export let Velocity = j.value<Vector2>({x: "f32", y: "f32"})
