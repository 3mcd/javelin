import { UNSAFE_internals } from "../../internal"

export function useWorld() {
  return UNSAFE_internals.worlds[UNSAFE_internals.currentWorldId]
}
