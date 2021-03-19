import { Component, ComponentOf, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { createStackPool } from "../../pool"
import { Signal } from "../../signal"
import { World } from "../../world"

type EntityComponentPair = [number, Component]

type EntityFilterIteratee = <T extends ComponentType>(
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

const createEntityFilterEffect = (
  getSignal: (world: World) => World["attached"] | World["detached"],
) =>
  createEffect(world => {
    const ready: EntityComponentPair[] = []
    const staged: EntityComponentPair[] = []
    const forEach = (iteratee: EntityFilterIteratee) => {
      for (let i = 0; i < ready.length; i++) {
        iteratee(ready[i][0], ready[i][1])
      }
    }
    const api = { forEach }

    let c: ComponentType

    getSignal(world).subscribe((entity, components) => {
      for (let i = 0; i < components.length; i++) {
        const component = components[i]
        if (c && component._tid === c.type) {
          const event = pairPool.retain()
          event[0] = entity
          event[1] = component
          staged.push(event)
        }
      }
    })

    return <T extends ComponentType>(componentType: T) => {
      c = componentType

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
 * Get components of a given type that were attached during the previous tick.
 *
 * @example
 * const sys_physics = () => {
 *   attached(Body).forEach(([entity, body]) => {
 *     // set up body state
 *   })
 * }
 */
export const attached = createEntityFilterEffect(world => world.attached)

/**
 * Get components of a given type that were detached during the previous tick.
 *
 * @example
 * const sys_physics = () => {
 *   detached(Body).forEach(([entity, body]) => {
 *     // tear down body state
 *   })
 * }
 */
export const detached = createEntityFilterEffect(world => world.detached)
