import { Component, ComponentOf, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { createStackPool } from "../../pool"
import { World } from "../../world"

type EntityComponentPair = [number, Component]

type TriggerIteratee = <T extends ComponentType>(
  entity: number,
  component: ComponentOf<T>,
) => void

const pairPool = createStackPool(
  () => ([-1, null] as unknown) as EntityComponentPair,
  event => {
    event[0] = -1
    ;(event as any)[1] = null
    return event
  },
  1000,
)

const createTrigger = (
  worldSignalSelector: (world: World) => World["attached"] | World["detached"],
) =>
  createEffect(world => {
    const ready: EntityComponentPair[] = []
    const staged: EntityComponentPair[] = []
    const forEach = (iteratee: TriggerIteratee) => {
      for (let i = 0; i < ready.length; i++) {
        iteratee(ready[i][0], ready[i][1])
      }
    }
    const api = {
      forEach,
      [Symbol.iterator]: () => ready[Symbol.iterator](),
    }
    const signal = worldSignalSelector(world)

    let type: number | null = null

    signal.subscribe((entity, components) => {
      if (type === null) {
        return
      }
      for (let i = 0; i < components.length; i++) {
        const component = components[i]
        if (component._tid === type) {
          const event = pairPool.retain()
          event[0] = entity
          event[1] = component
          staged.push(event)
        }
      }
    })

    return <T extends ComponentType>(componentType: T) => {
      type = componentType.type

      let r: EntityComponentPair | undefined
      while ((r = ready.pop())) {
        pairPool.release(r)
      }

      let s: EntityComponentPair | undefined
      while ((s = staged.pop())) {
        ready.push(s)
      }

      return api
    }
  })

/**
 * Get components of a given type that were attached during the effect's
 * last execution.
 *
 * @example <caption>Iterate using `forEach`</caption>
 * onAttach(Body).forEach((entity, body) => {
 *   // body was attached to entity last tick
 * })
 * @example <caption>Iterate using `for..of`</caption>
 * for (const [entity, body] of onAttach(Body)) {
 *   // body was attached to entity last tick
 * }
 */
export const onAttach = createTrigger(world => world.attached)

/**
 * Get components of a given type that were detached during the effect's
 * last execution. Note – the component is reset and re-pooled, but is
 * provided if a referential comparison should be made.
 *
 * @example <caption>Iterate using `forEach`</caption>
 * onDetach(Body).forEach((entity, body) => {
 *   // body was detached from entity last tick, and is reset and re-pooled
 * })
 * @example <caption>Iterate using `for..of`</caption>
 * for (const [entity, body] of onDetach(Body)) {
 *   // body was detached from entity last tick, and is reset and re-pooled
 * }
 */
export const onDetach = createTrigger(world => world.detached)
