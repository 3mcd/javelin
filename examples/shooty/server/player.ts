import * as j from "@javelin/ecs"
import {Input, Position} from "./model.js"

export let movePlayerSystem = (world: j.World) => {
  world.commands(Input).forEach(command => {
    let pos = world.get(command, Position)!
    pos.x += 1
    pos.y += 1
  })
}
