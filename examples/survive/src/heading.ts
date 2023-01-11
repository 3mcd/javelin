import {value} from "@javelin/ecs"

type Heading = {
  x: number
  y: number
}

export let Heading = value<Heading>({x: "f32", y: "f32"})
