import * as j from "@javelin/ecs"
import {Input, Position} from "./model.js"

let movePlayerSystem = (world: j.World) => {
  world.commands(Input).forEach(command => {
    let pos = world.get(command.entity, Position)!
    pos.x += 1
    pos.y += 1
  })
}

export let playerPlugin = (app: j.App) => {
  app.addSystem(movePlayerSystem)
}
