import { EffectExecutor, EffectFactory } from "../effect"
import { World } from "../world"

export function createEffect<S, A extends any[], W extends unknown>(
  factory: EffectFactory<S, A, W>,
): EffectExecutor<S, A> {
  let executor: EffectExecutor<S, A>
  const reset = (world: World<W> = {} as World<W>) => {
    executor = factory(world)
  }
  const api = (...args: A) => {
    return executor(...args)
  }

  // @ts-ignore
  api.reset = reset

  return api
}
