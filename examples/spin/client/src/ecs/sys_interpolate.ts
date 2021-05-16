import { component, useMonitor } from "@javelin/ecs"
import { interpBufferInsert, interpBufferPool, Interpolate } from "./components"
import { effNet } from "./eff_net"
import { qryInterpolate, qryTransforms } from "./queries"
import { world } from "./world"

export const sysInterpolate = () => {
  const { patched, updated } = effNet()
  const test = performance.now() - 1000

  useMonitor(qryTransforms, (e, [t]) => {
    t &&
      world.attach(
        e,
        component(Interpolate, { x: t.position[0], y: t.position[1] }),
      )
  })

  for (const [entities, [transforms, interpolates]] of qryInterpolate) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const {
        position: [x, y],
      } = transforms[i]
      const ip = interpolates[i]
      const { buffer } = ip

      if (patched.has(e) || updated.has(e)) {
        interpBufferInsert(x, y, ip)
        const now = performance.now()
        ip.adaptiveSendRate = (now - test) / 1000
      }
      const renderTime = test / ip.adaptiveSendRate

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
