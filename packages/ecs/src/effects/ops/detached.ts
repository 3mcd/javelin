import { Component, ComponentType } from "../../component"
import { createEffect } from "../../effect"
import { mutableEmpty } from "../../util"

/**
 * Get components of a given type that were detached during the previous tick.
 *
 * @example
 * const sys_physics = () => {
 *   detached(Body).forEach(body => {
 *     // tear down body state
 *   })
 * }
 */
export const detached = createEffect(world => {
  const previous: Component[] = []
  const current: Component[] = []

  let c: ComponentType

  world.detached.subscribe(component => {
    if (c && component._tid === c.type) {
      current.push(component)
    }
  })

  return <T extends ComponentType>(componentType: T) => {
    c = componentType

    mutableEmpty(previous)

    let component: Component
    while ((component = current.pop()!)) {
      previous.push(component)
    }

    return previous
  }
})
