import { createEffect, EffectOptions } from "./effect"
import { useRef } from "./effects/core/use_ref"
import { World } from "./world"

export type RefInitializer<T> = (world: World) => T

export const createRef = <T>(
  initializer: RefInitializer<T>,
  options: EffectOptions = {},
) =>
  createEffect(world => {
    const initialValue = initializer(world)
    return () => useRef(initialValue)
  }, options)

export function createImmutableRef<T>(
  initializer: RefInitializer<T>,
  options: EffectOptions = {},
) {
  return createEffect(world => {
    const initialValue = initializer(world)
    return () => useRef(initialValue).value
  }, options)
}
