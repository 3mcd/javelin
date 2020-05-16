import { World } from "@javelin/ecs"
import { junk, wormholes } from "../queries"
import { Tags } from "../tags"
import { calcWormholeHorizon } from "../utils/calc_wormhole_horizon"

export const canvas = document.createElement("canvas")
export const context = canvas.getContext("2d")!

canvas.width = window.innerWidth
canvas.height = window.innerHeight

canvas.style.width = "100%"
canvas.style.height = "100%"

document.body.appendChild(canvas)

export function render(_: void, world: World) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for (const [position] of world.query(junk)) {
    context.fillStyle = world.hasTag(position._e, Tags.Influenced)
      ? "#00ff00"
      : "#eeeeee"
    context.fillRect(position.x, position.y, 1, 1)
  }

  for (const [position, wormhole] of world.query(wormholes)) {
    context.fillStyle = "#000000"
    context.strokeStyle = "#333333"
    context.beginPath()
    context.arc(
      position.x,
      position.y,
      calcWormholeHorizon(wormhole),
      0,
      2 * Math.PI,
    )
    context.stroke()
  }
}
