import { ComponentOf, arrayOf, number } from "@javelin/ecs"
import { createStackPool } from "../pool"

export const Camera = {
  x: number,
  y: number,
}

export const Interpolate = {
  x: number,
  y: number,
  buffer: arrayOf(arrayOf(number)),
  adaptiveSendRate: number,
  lastUpdateTime: number,
}

export const interpBufferPool = createStackPool<number[]>(
  () => [],
  ib => {
    ib.length = 0
    return ib
  },
  1000,
)
export const interpBufferInsert = (
  x: number,
  y: number,
  ip: ComponentOf<typeof Interpolate>,
) => {
  const item = interpBufferPool.retain()
  item[0] = performance.now()
  item[1] = x
  item[2] = y
  // @ts-ignore
  ip.buffer.push(item)
  return item
}
