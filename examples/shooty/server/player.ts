import * as j from "@javelin/ecs"
import {Input, Position} from "../shared/model.js"

export function movePlayerSystem(world: j.World) {
  let commands = world.getResource(j.Commands)
  commands.of(Input, command => {
    if (world.has(command.entity, Position)) {
      let pos = world.get(command.entity, Position)!
      pos.x += command.h
      pos.y += command.v
    }
  })
}
