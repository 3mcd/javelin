import { UNSAFE_internals } from "./internal"
import { World } from "./world"

/**
 * The effect executor is a function type that captures the return value and
 * an arbitrary list of arguments.
 */
export type EffectExecutor<S, A extends unknown[]> = (...args: A) => S

/**
 * The effect's API is the contract that the effect and system operate under.
 * It extends the interface of the effect executor by also unwrapping resolved
 * promise values.
 */
export type EffectApi<S, A extends unknown[]> = EffectExecutor<
  UnwrappedEffectState<S>,
  A
>

/**
 * An effect factory is a function that creates an effect. It is executed for
 * each instance of an effect in a system, unless the effect is configured to
 * be `shared`, in which case it is executed only once during the lifetime of
 * the application. It accepts a world instance as its only parameter and
 * returns an effect executor. The executor can utilize the factory closure to
 * implement local state that persists between calls.
 * @example <caption>local state</caption>
 * const factory: EffectFactory<number> = () => {
 *   let i = 0;
 *   return () => i++
 * }
 */
export type EffectFactory<S, A extends unknown[] = [], T = unknown> = (
  world: World<T>,
) => EffectExecutor<S, A>

export type EffectOptions = {
  /**
   * Limit this effect to a single instance that will be executed a maximum of
   * once per tick and share its state across all consumers.
   * @example
   * const useObject = createEffect(() => () => ({}), { shared: true })
   * // in a system:
   * assert(useObject() === useObject())
   */
  shared?: boolean
}

type UnwrappedEffectState<S> = S extends Promise<infer PS> ? PS | null : S

type CellEffectData<S, A extends unknown[]> = {
  executor: EffectExecutor<S, A>
  lockAsync: boolean
  lockShare: boolean
  lockShareTick: number | null
  state: UnwrappedEffectState<S>
}

type SystemEffectData<S = unknown, A extends unknown[] = []> = {
  cellCount: number
  cells: CellEffectData<S, A>[]
}

function isPromise<T = unknown>(object: unknown): object is Promise<T> {
  return typeof object === "object" && object !== null && "then" in object
}

/**
 * Create an effect by specifying an effect factory and optional configuration
 * options.
 *
 * An effect is a stateful function that is used to implement logic in systems
 * without use of singleton components or global state. Each function has
 * access to a closure (the factory) that is used to implement local variables
 * that persist between steps of the world. Effects are called just like normal
 * functions within systems. Javelin automatically resolves the correct closure
 * based on the order the effect is called in within a system.
 *
 * @example
 * const useCounter = createEffect(() => {
 *   // closure
 *   let i = 0
 *   return (base: number) => base + i++
 * })
 * // in a system:
 * // (step 0)
 * const a = useCounter(0)  // 0
 * const b = useCounter(10) // 10
 * // (step 1)
 * const a = useCounter(0)  // 1
 * const b = useCounter(10) // 11
 */
export function createEffect<
  S = unknown,
  A extends unknown[] = [],
  W extends unknown = void,
>(
  factory: EffectFactory<S, A, W>,
  options: EffectOptions = { shared: false },
): EffectApi<S, A> {
  const { shared: global } = options
  const systemEffectDataByWorldId: SystemEffectData[][] = []

  let previousStep: number
  let previousWorld: number
  let previousSystem: number

  let currentWorld: number
  let latestSystemId: number
  let cellCount: number = -1

  return function effect(...args: A) {
    currentWorld = UNSAFE_internals.currentWorldId

    const world = UNSAFE_internals.worlds[currentWorld] as World<W>
    const step = world.latestTick

    latestSystemId = global ? 0 : world.latestSystemId

    let currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld]

    if (systemEffectDataByWorldId[currentWorld] === undefined) {
      currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld] =
        []
    }

    let currentSystemEffect = currentWorldSystemEffectData[latestSystemId]

    if (currentSystemEffect === undefined) {
      currentSystemEffect = currentWorldSystemEffectData[latestSystemId] = {
        cells: [],
        cellCount: -1,
      }
    }

    if (
      global === true ||
      (previousWorld !== currentWorld && previousWorld !== undefined)
    ) {
      cellCount = 0
    } else if (
      previousSystem !== undefined &&
      (previousStep !== step || previousSystem !== latestSystemId)
    ) {
      let previousSystemEffectData =
        currentWorldSystemEffectData[previousSystem]

      if (
        previousSystemEffectData.cellCount !== -1 &&
        previousSystemEffectData.cellCount !== cellCount
      ) {
        throw new Error(
          `Failed to execute effect: encountered too ${
            previousSystemEffectData.cellCount > cellCount ? "few" : "many"
          } effects this step`,
        )
      }

      previousSystemEffectData.cellCount = cellCount
      cellCount = 0
    } else {
      cellCount++
    }

    let cell = currentSystemEffect.cells[cellCount] as CellEffectData<S, A>

    if (!cell) {
      cell = currentSystemEffect.cells[cellCount] = {
        executor: factory(world),
        lockShare: false,
        lockAsync: false,
        lockShareTick: null,
        state: null as UnwrappedEffectState<S>,
      }
    }

    if (global) {
      if (cell.lockShareTick !== world.latestTick) {
        cell.lockShare = false
        cell.lockShareTick = world.latestTick
      } else {
        cell.lockShare = true
      }
    }

    if (cell.lockShare || cell.lockAsync) {
      return cell.state
    }

    const result = cell.executor(...args)

    if (isPromise<UnwrappedEffectState<S>>(result)) {
      cell.lockAsync = true
      result
        .then(result => (cell.state = result))
        .catch(error =>
          console.error(`Uncaught error in effect: ${error.message}`, error),
        )
        .then(() => (cell.lockAsync = false))
    } else {
      cell.state = result as UnwrappedEffectState<S>
    }

    previousStep = step
    previousWorld = currentWorld
    previousSystem = latestSystemId

    return cell.state
  }
}
