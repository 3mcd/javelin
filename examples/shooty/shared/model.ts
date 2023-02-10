import * as j from "@javelin/ecs"

export interface Vector2 {
  x: number
  y: number
}
export let Input = j.command({entity: "entity", h: "i8", v: "i8"})
export let Position = j.value<Vector2>({x: "f32", y: "f32"})
export let Velocity = j.value<Vector2>({x: "f32", y: "f32"})
export let model = [Position, Velocity, Input]
