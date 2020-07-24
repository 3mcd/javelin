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

export function render(world: World) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight)

  for (const [p] of junk(world)) {
    // context.fillStyle = world.hasTag(p._e, Tags.Influenced)
    //   ? "#00ff00"
    //   : "#eeeeee"
    // context.fillRect(p.x, p.y, 1, 1)
  }

  for (const [p, w] of wormholes(world)) {
    // context.fillStyle = "#000000"
    // context.strokeStyle = "#333333"
    // context.beginPath()
    // context.arc(p.x, p.y, calcWormholeHorizon(w), 0, 2 * Math.PI)
    // context.stroke()
  }
}
