import { usePerformance } from "./use_performance"
import { useRef } from "./use_ref"

export function useInterval(interval: number) {
  const ref = useRef(interval)
  const performance = usePerformance()
  const prev = useRef(0)
  if (!performance) {
    return
  }
  const time = performance.now()
  if (!prev.value) {
    prev.value = time
  }
  if (interval !== ref.value) {
    prev.value = time
    ref.value = interval
  }
  let hit = false
  if (time - prev.value >= interval) {
    hit = true
    prev.value = time
  }
  return hit
}
