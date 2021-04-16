import { Component, ComponentOf, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { $type } from "../../internal/symbols"
import { createStackPool } from "../../pool"
import { Collection } from "../../types"
import { World } from "../../world"

type EntityComponentPair<C extends ComponentType = ComponentType> = [
  number,
  ComponentOf<C>,
]
type TriggerEffectApi<C extends ComponentType = ComponentType> = Collection<
  EntityComponentPair<C>
>

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
  emitExisting = false,
  pruneDestroyed = false,
) =>
  createEffect(world => {
    const {
      storage: { archetypes },
    } = world
    const entities = new Set<Entity>()
    const ready: EntityComponentPair[] = []
    const staged: EntityComponentPair[] = []
    const api: TriggerEffectApi = {
      forEach(iteratee) {
        for (let i = 0; i < ready.length; i++) {
          iteratee(ready[i][0], ready[i][1])
        }
      },
      [Symbol.iterator]: () => ready[Symbol.iterator](),
    }
    const signal = worldSignalSelector(world)
    const push = (entity: Entity, component: Component) => {
      const pair = pairPool.retain()
      pair[0] = entity
      pair[1] = component
      staged.push(pair)
      entities.add(entity)
    }
    const initialize = (componentType: ComponentType) => {
      if (!emitExisting) {
        return
      }
      for (let i = 0; i < archetypes.length; i++) {
        const { table, entities, signatureInverse } = archetypes[i]
        const index = signatureInverse[componentType[$type]]

        if (index !== undefined) {
          const column = table[index]

          for (let i = 0; i < entities.length; i++) {
            push(entities[i], column[i])
          }
        }
      }
    }

    let type: number | null = null

    signal.subscribe((entity, components) => {
      if (type === null) {
        return
      }
      for (let i = 0; i < components.length; i++) {
        const component = components[i]
        if (component.__type__ === type) {
          push(entity, component)
        }
      }
    })

    if (pruneDestroyed) {
      world.destroyed.subscribe(entity => {
        if (entities.has(entity)) {
          let i = 0
          while (i < staged.length) {
            if (staged[i][0] === entity) {
              const head = staged.pop()
              if (staged.length === 0) {
                continue
              }
              staged[i] = head!
            } else {
              i++
            }
          }
        }
      })
    }

    return function effTrigger<C extends ComponentType>(
      componentType: C,
    ): TriggerEffectApi<C> {
      if (type === null) {
        initialize(componentType)
      }

      type = componentType[$type]

      let r: EntityComponentPair | undefined
      while ((r = ready.pop())) {
        pairPool.release(r)
      }

      let s: EntityComponentPair | undefined
      while ((s = staged.pop())) {
        ready.push(s)
      }

      entities.clear()

      return api as TriggerEffectApi<C>
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
export const effAttach = createTrigger(world => world.attached, true, true)

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
export const effDetach = createTrigger(world => world.detached)
