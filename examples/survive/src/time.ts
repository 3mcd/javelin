import * as j from "@javelin/ecs"

export type Time = {
  previous: number
  current: number
  delta: number
}
export let Time = j.resource<Time>()

export let advanceTimeSystem = (world: j.World) => {
  let time = world.getResource(Time)
  let current = performance.now() / 1_000
  let previous = time.current
  time.previous = previous
  time.current = current
  time.delta = current - previous
}

export let timePlugin = (app: j.App) =>
  app
    .addResource(Time, {previous: 0, current: 0, delta: 0})
    .addSystemToGroup(j.Group.Early, advanceTimeSystem)
