import * as j from "@javelin/ecs"

type Heading = {
  x: number
  y: number
}

export let Heading = j.value<Heading>({x: "f32", y: "f32"})
