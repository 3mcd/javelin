import { Component, ComponentOf, ComponentType } from "./component"
import { World } from "./world"

/**
 * A Filter is an object containing methods used to filter queries by entity
 * and component.
 */
export type ComponentFilter<T extends ComponentType = ComponentType> = {
  componentType: T
  /**
   * Filter by individual component. Return true if the associated entity's
   * components should be included in query results.
   *
   * @param component Subject entity's component
   * @param world World of query
   */
  componentPredicate(component: Component, world: World): unknown
}

export function createComponentFilter<T extends ComponentType>(
  getPredicate: () => (component: ComponentOf<T>, world: World) => boolean,
) {
  return <T extends ComponentType>(componentType: T): ComponentFilter<T> => ({
    componentType,
    componentPredicate: getPredicate(),
  })
}
