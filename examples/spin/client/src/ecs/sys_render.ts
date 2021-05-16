import { useInterval, useRef, World } from "@javelin/ecs"
import { Entity } from "@javelin/ecs/dist/cjs/entity"
// @ts-ignore
import { Big } from "../../../server/components"
import { CanvasRef } from "../Canvas"
import { Camera } from "./components"
import { effNet } from "./eff_net"
import { qryShells } from "./queries"

const getShellColor = (s: number) => {
  const v = (16 - s * 2).toString(16)
  return `#${v}${v}${v}`
}

export const createRenderSystem = (
  world: World,
  canvas: CanvasRef,
  camera: Entity,
) => {
  const { context } = canvas

  if (context === null) {
    throw new Error("Failed loading canvas.")
  }

  return function sysRender() {
    const net = effNet()
    const rate = useRef(0)
    const update = useInterval(1000)
    const c = world.get(camera, Camera)
    const ox = c.x - canvas.width / 2
    const oy = c.y - canvas.height / 2

    if (update) {
      rate.value = net.bytes / 1000
      net.bytes = 0
    }

    context.textAlign = "center"
    context.font = "12px SF Mono, Consolas, Courier New, monospace"
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (const [entities, [shells, interpolates]] of qryShells) {
      for (let i = 0; i < entities.length; i++) {
        const { x, y } = interpolates[i]
        const entity = entities[i]
        const big = world.has(entity, Big)
        const size = big ? 3 : 1
        context.fillStyle = getShellColor(shells[i].value as number)
        context.fillRect(x - ox, y - oy, size, size)
      }
    }
    context.fillStyle = "#fff"
    context.fillText(`${Math.floor(rate.value)} kb/s`, -ox, -oy + 4)
  }
}
