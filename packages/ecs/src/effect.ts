import { globals } from "./internal/globals"
import { World } from "./world"

export type EffectApi<S, A extends any[]> = { running?: boolean } & ((
  world: World,
  ...args: A
) => S | Promise<S>)
export type EffectFactory<S, A extends any[]> = () => EffectApi<S, A>
export type EffectOptions = { throw?: boolean; global?: boolean }

export function createEffect<S, A extends any[]>(
  factory: EffectFactory<S, A>,
  options: EffectOptions = { throw: false, global: false },
) {
  const systemCellCountLookup: number[][] = []
  const effectLookup: EffectApi<S, A>[][][] = []
  const stateLookup: S[][][] = []

  let previousTick: number
  let previousWorld: number
  let previousSystem: number

  let currentWorld: number
  let currentSystem: number
  let cellCount: number = -1

  const setState = (
    nextState: S,
    world: number,
    system: number,
    cell: number,
  ) => (stateLookup[world][system][cell] = nextState)

  return (...args: A) => {
    currentWorld = globals.__CURRENT_WORLD__

    const world = globals.__WORLDS__[currentWorld]
    const currentTick = world.state.currentTick

    currentSystem = options.global ? 0 : world.state.currentSystem

    if (
      options.global === true ||
      (previousWorld !== currentWorld && previousWorld !== undefined)
    ) {
      cellCount = 0
    } else if (
      previousTick !== currentTick ||
      (previousSystem !== currentSystem && previousSystem !== undefined)
    ) {
      let systemCellCount = systemCellCountLookup[currentWorld]

      if (systemCellCountLookup[currentWorld] === undefined) {
        systemCellCount = systemCellCountLookup[currentWorld] = []
      }

      const previousCellCount = systemCellCount[previousSystem]

      if (previousCellCount !== undefined && previousCellCount !== cellCount) {
        throw new Error(
          `Failed to execute effect: encountered too ${
            previousCellCount > cellCount ? "few" : "many"
          } hooks this tick`,
        )
      }

      systemCellCount[previousSystem] = cellCount
      cellCount = 0
    } else {
      cellCount++
    }

    if (stateLookup[currentWorld] === undefined) {
      stateLookup[currentWorld] = []
    }

    let cellLookup = stateLookup[currentWorld][currentSystem]

    if (cellLookup === undefined) {
      cellLookup = stateLookup[currentWorld][currentSystem] = []
    }

    if (effectLookup[currentWorld] === undefined) {
      effectLookup[currentWorld] = []
    }

    let executorLookup = effectLookup[currentWorld][currentSystem]

    if (executorLookup === undefined) {
      executorLookup = effectLookup[currentWorld][currentSystem] = []
    }

    let executor = executorLookup[cellCount]
    let state: S = cellLookup[cellCount]

    if (executor === undefined) {
      executor = factory()
      executorLookup[cellCount] = executor
    } else if (executor.running === true) {
      return state
    }

    const result = executor(world, ...args)

    if (typeof result === "object" && result !== null && "then" in result) {
      let world = currentWorld
      let system = currentSystem
      let cell = cellCount
      executor.running = true
      result
        .then(result => setState(result, world, system, cell))
        .catch(error =>
          console.error(`Uncaught error in effect: ${error.message}`, error),
        )
        .then(() => (executor.running = false))
    } else {
      state = setState(result, currentWorld, currentSystem, cellCount)
    }

    previousTick = currentTick
    previousWorld = currentWorld
    previousSystem = currentSystem

    return state
  }
}
