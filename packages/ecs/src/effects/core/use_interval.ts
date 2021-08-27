import { usePerformance } from "./use_performance"
import { useRef } from "./use_ref"

export function useInterval(interval: number) {
  const performance = usePerformance()
  const config = useRef(interval)
  const prev = useRef(0)
  const time = performance.now()
  if (!prev.value) {
    prev.value = time
  }
  if (interval !== config.value) {
    prev.value = time
    config.value = interval
  }
  let hit = false
  if (time - prev.value >= interval) {
    hit = true
    prev.value = time
  }
  return hit
}
