import {App, Group, resource, World} from "@javelin/ecs"

export type Time = {
  previous: number
  current: number
  delta: number
}
export let Time = resource<Time>()

export let advance_time_system = (world: World) => {
  let time = world.get_resource(Time)
  let current = performance.now() / 1_000
  let previous = time.current
  time.previous = previous
  time.current = current
  time.delta = current - previous
}

export let time_plugin = (app: App) =>
  app
    .add_resource(Time, {previous: 0, current: 0, delta: 0})
    .add_system_to_group(Group.Early, advance_time_system)
