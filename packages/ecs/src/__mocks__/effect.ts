import { EffectExecutor, EffectFactory, World } from "../../dist/cjs"

export const $reset = Symbol("reset")

export function createEffect<S, A extends any[]>(
  factory: EffectFactory<S, A>,
): EffectExecutor<S, A> {
  let executor: EffectExecutor<S, A>

  const reset = () => (executor = factory({} as World))
  const api = (...args: A) => {
    return executor(...args)
  }

  Object.defineProperty(api, $reset, {
    value: reset,
  })

  reset()

  return api
}
