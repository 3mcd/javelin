import {App, Group, resource, World} from "@javelin/ecs"
import {advance_time_system, Time} from "./time.js"

export let Clock = resource<{time: number; tick: number}>()

export let advance_clock_system = (world: World) => {
  let {current} = world.get_resource(Time)
  let clock = world.get_resource(Clock)
  clock.time = current
  clock.tick++
}

export let clock_plugin = (app: App) =>
  app
    .add_resource(Clock, {time: 0, tick: 0})
    .add_system_to_group(Group.Early, advance_clock_system, _ =>
      _.after(advance_time_system),
    )
