import { UNSAFE_internals } from "./internal"
import { World } from "./world"

export type EffectApi<S, A extends any[]> = (
  ...args: A
) => UnwrappedEffectState<S>
export type EffectExecutor<S, A extends any[]> = (...args: A) => S
export type EffectFactory<S, A extends any[], W> = (
  world: World<W>,
) => EffectExecutor<S, A>
export type EffectOptions = { throw?: boolean; global?: boolean }

type UnwrappedEffectState<S> = S extends Promise<infer PS> ? PS | null : S

type CellEffectData<S, A extends any[]> = {
  executor: EffectExecutor<S, A>
  lockAsync: boolean
  lockGlobal: boolean
  lockGlobalTick: number | null
  state: UnwrappedEffectState<S>
}

type SystemEffectData<S = any, A extends any[] = []> = {
  cellCount: number
  cells: CellEffectData<S, A>[]
}

function isPromise<T = unknown>(object: unknown): object is Promise<T> {
  return typeof object === "object" && object !== null && "then" in object
}

export function createEffect<
  S = unknown,
  A extends any[] = [],
  W extends unknown = void,
>(
  factory: EffectFactory<S, A, W>,
  options: EffectOptions = { throw: false, global: false },
): EffectApi<S, A> {
  const { global } = options
  const systemEffectDataByWorldId: SystemEffectData[][] = []

  let previousStep: number
  let previousWorld: number
  let previousSystem: number

  let currentWorld: number
  let latestSystem: number
  let cellCount: number = -1

  return function effect(...args: A) {
    currentWorld = UNSAFE_internals.currentWorldId

    const world = UNSAFE_internals.worlds[currentWorld] as World<W>
    const step = world.latestStep

    latestSystem = global ? 0 : world.latestSystem

    let currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld]

    if (systemEffectDataByWorldId[currentWorld] === undefined) {
      currentWorldSystemEffectData = systemEffectDataByWorldId[currentWorld] =
        []
    }

    let currentSystemEffect = currentWorldSystemEffectData[latestSystem]

    if (currentSystemEffect === undefined) {
      currentSystemEffect = currentWorldSystemEffectData[latestSystem] = {
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
      (previousStep !== step || previousSystem !== latestSystem)
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
        lockGlobal: false,
        lockAsync: false,
        lockGlobalTick: null,
        state: null as UnwrappedEffectState<S>,
      }
    }

    if (global) {
      if (cell.lockGlobalTick !== world.latestStep) {
        cell.lockGlobal = false
        cell.lockGlobalTick = world.latestStep
      } else {
        cell.lockGlobal = true
      }
    }

    if (cell.lockGlobal || cell.lockAsync) {
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
    previousSystem = latestSystem

    return cell.state
  }
}
