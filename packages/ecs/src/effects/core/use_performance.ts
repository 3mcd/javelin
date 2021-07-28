import { createEffect } from "../../effect"

export const usePerformance = createEffect(() => {
  let performance: Performance | Promise<Performance>
  return function usePerformance() {
    if (performance === undefined) {
      if (typeof window === "object" && "performance" in window) {
        performance = window.performance
      } else {
        // assume node environment
        performance = import("perf_hooks").then(
          m => m.performance as unknown as Performance,
        )
      }
    }
    return performance
  }
})
