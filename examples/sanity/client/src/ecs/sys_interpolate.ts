import { useMonitor, component } from "@javelin/ecs"
// @ts-ignore
import { Transform } from "../../../server/components.mjs"
import { interpBufferInsert, interpBufferPool, Interpolate } from "./components"
import { eff_net } from "./eff_net"
import { qry_interpolate, qry_transforms } from "./queries"
import { world } from "./world"

const SEND_RATE = 10

export const sys_interpolate = () => {
  const { patched, updated } = eff_net()
  const renderTime = performance.now() - 1000 / SEND_RATE

  useMonitor(qry_transforms, (e, [t]) => {
    t &&
      world.attach(
        e,
        component(Interpolate, { x: t.position[0], y: t.position[1] }),
      )
  })

  for (const [entities, [transforms, interpolates]] of qry_interpolate) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const {
        position: [x, y],
      } = transforms[i]
      const ip = interpolates[i]
      const { buffer } = ip

      if (patched.has(e) || updated.has(e)) {
        interpBufferInsert(x, y, ip)
      }

      while (buffer.length >= 2 && buffer[1][0] <= renderTime) {
        const item = buffer.shift()
        if (item) {
          interpBufferPool.release(item)
        }
      }

      if (
        buffer.length >= 2 &&
        buffer[0][0] <= renderTime &&
        renderTime <= buffer[1][0]
      ) {
        // @ts-ignore
        const [[t0, x0, y0], [t1, x1, y1]] = buffer
        ip.x = x0 + ((x1 - x0) * (renderTime - t0)) / (t1 - t0)
        ip.y = y0 + ((y1 - y0) * (renderTime - t0)) / (t1 - t0)
      }
    }
  }
}
