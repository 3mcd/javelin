import { createEffect } from "../../effect"
import { performance } from "@javelin/isomorphic-utils"

export const usePerformance = createEffect(() => {
  return function usePerformance() {
    return performance
  }
})
