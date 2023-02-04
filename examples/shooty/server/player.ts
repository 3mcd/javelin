import * as j from "@javelin/ecs"
import {Input, Position} from "../shared/model.js"

let movePlayerSystem = (world: j.World) => {
  let commands = world.getResource(j.Commands)
  commands.of(Input).forEach(command => {
    let pos = world.get(command.entity, Position)!
    pos.x += 1
    pos.y += 1
  })
}

export let playerPlugin = (app: j.App) => {
  app.addSystem(movePlayerSystem)
}
