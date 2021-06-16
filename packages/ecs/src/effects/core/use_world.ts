import { UNSAFE_internals } from "../../internal"
import { World } from "../../world"

export function useWorld<T>(): World<T> {
  return UNSAFE_internals.worlds[UNSAFE_internals.currentWorldId] as World<T>
}
