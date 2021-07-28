import { createEffect, EffectOptions } from "./effect"
import { useRef } from "./effects/core/use_ref"
import { World } from "./world"

export type RefInitializer<$Type> = (world: World) => $Type

export const createRef = <$Type>(
  initializer: RefInitializer<$Type>,
  options: EffectOptions = {},
) =>
  createEffect(world => {
    const initialValue = initializer(world)
    return () => useRef(initialValue)
  }, options)

export function createImmutableRef<$Type>(
  initializer: RefInitializer<$Type>,
  options: EffectOptions = {},
) {
  return createEffect(world => {
    const initialValue = initializer(world)
    return () => useRef(initialValue).value
  }, options)
}
