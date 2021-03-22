import { Component, ComponentOf, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { createStackPool } from "../../pool"
import { Signal } from "../../signal"
import { mutableEmpty } from "../../util"
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

const createComponentFilterEffect = (
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
export const attached = createComponentFilterEffect(world => world.attached)

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
export const detached = createComponentFilterEffect(world => world.detached)

const createEntityFilterEffect = (
  getSignal: (world: World) => World["spawned"] | World["destroyed"],
) =>
  createEffect(world => {
    const ready: number[] = []
    const staged: number[] = []

    getSignal(world).subscribe(entity => staged.push(entity))

    return () => {
      let s: number | undefined
      mutableEmpty(ready)
      while ((s = staged.pop())) {
        ready.push(s)
      }
      return ready
    }
  })

/**
 * Get all entities spawned last tick.
 *
 * @example
 * const sys_physics = world => {
 *   spawned().forEach(entity => ...)
 * }
 */
export const spawned = createEntityFilterEffect(world => world.spawned)

/**
 * Get all entities destroyed last tick.
 *
 * @example
 * const sys_physics = world => {
 *   destroyed().forEach(entity => ...)
 * }
 */
export const destroyed = createEntityFilterEffect(world => world.destroyed)
