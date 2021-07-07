import { createEffect } from "../../effect"

export const usePerformance = createEffect(() => {
  return function usePerformance() {
    if (typeof window === "object" && "performance" in window) {
      return window.performance
    } else {
      // assume node environment
      return import("perf_hooks").then(m => m.performance)
    }
  }
})
