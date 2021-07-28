import { UNSAFE_internals } from "../../internal"
import { World } from "../../world"

export function useWorld<$Tick>(): World<$Tick> {
  return UNSAFE_internals.worlds[
    UNSAFE_internals.currentWorldId
  ] as World<$Tick>
}
