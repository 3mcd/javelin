import {component} from "@javelin/ecs"

type Heading = {
  x: number
  y: number
}

export let Heading = component<Heading>({x: "f32", y: "f32"})
