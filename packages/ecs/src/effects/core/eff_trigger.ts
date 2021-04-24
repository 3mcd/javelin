import { Component, ComponentOf, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { Entity } from "../../entity"
import { $type } from "../../internal/symbols"
import { createStackPool } from "../../pool"

type EntityComponentPair<C extends ComponentType = ComponentType> = [
  number,
  ComponentOf<C>,
]
type TriggerCallback<C extends ComponentType> = (
  entity: number,
  component: ComponentOf<C>,
) => unknown

const pairPool = createStackPool(
  () => ([-1, null] as unknown) as EntityComponentPair,
  event => {
    event[0] = -1
    ;(event as any)[1] = null
    return event
  },
  1000,
)

/**
 * Get components of a given type that were attached or detached during the
 * effect's last execution.
 *
 * @example
 * effTrigger(
 *   Body,
 *   (e, body) => console.log(`${e}'s Body was attached last tick`),
 *   (e, body) => console.log(`${e}'s Body was detached last tick`),
 * )
 */
export const effTrigger = createEffect(world => {
  const {
    storage: { archetypes },
  } = world
  const entities = new Set<Entity>()
  const stagedEnter: EntityComponentPair[] = []
  const stagedExit: EntityComponentPair[] = []
  const readyEnter: EntityComponentPair[] = []
  const readyExit: EntityComponentPair[] = []

  let _componentType: ComponentType | null
  let _componentTypeId: number

  const push = (
    entity: Entity,
    component: Component,
    target: EntityComponentPair[],
  ) => {
    const pair = pairPool.retain()
    pair[0] = entity
    pair[1] = component
    target.push(pair)
    entities.add(entity)
  }

  const register = (componentType: ComponentType) => {
    for (let i = 0; i < archetypes.length; i++) {
      const { table, entities, signatureInverse } = archetypes[i]
      const index = signatureInverse[componentType[$type]]

      if (index !== undefined) {
        const column = table[index]

        for (let i = 0; i < entities.length; i++) {
          push(entities[i], column[i], stagedEnter)
        }
      }
    }

    _componentType = componentType
    _componentTypeId = componentType[$type]
  }

  world.attached.subscribe((e, components) => {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      if (component.__type__ === _componentTypeId) {
        push(e, component, stagedEnter)
      }
    }
  })

  world.detached.subscribe((e, components) => {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      if (component.__type__ === _componentTypeId) {
        push(e, component, stagedExit)
      }
    }
  })

  return function effTrigger<C extends ComponentType>(
    componentType: C,
    onEnter?: TriggerCallback<C>,
    onExit?: TriggerCallback<C>,
  ) {
    if (componentType !== _componentType) {
      register(componentType)
    }

    let rEnter: EntityComponentPair | undefined
    while ((rEnter = readyEnter.pop())) {
      pairPool.release(rEnter)
    }
    let rExit: EntityComponentPair | undefined
    while ((rExit = readyExit.pop())) {
      pairPool.release(rExit)
    }

    let sEnter: EntityComponentPair | undefined
    while ((sEnter = stagedEnter.pop())) {
      readyEnter.push(sEnter)
    }
    let sExit: EntityComponentPair | undefined
    while ((sExit = stagedExit.pop())) {
      readyExit.push(sExit)
    }

    entities.clear()

    if (onEnter) {
      for (let i = 0; i < readyEnter.length; i++) {
        const [entity, component] = readyEnter[i]
        onEnter(entity, component as ComponentOf<C>)
      }
    }

    if (onExit) {
      for (let i = 0; i < readyExit.length; i++) {
        const [entity, component] = readyExit[i]
        onExit(entity, component as ComponentOf<C>)
      }
    }
  }
})
