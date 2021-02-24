import { ComponentOf, ComponentType } from "./component"
import { World } from "./world"

export type ComponentFilterPredicate<
  T extends ComponentType = ComponentType
> = (component: ComponentOf<T>, world: World) => boolean

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
  componentPredicate: ComponentFilterPredicate<T>
}

export function createComponentFilter<T extends ComponentType>(
  getPredicate: () => ComponentFilterPredicate<T>,
) {
  return (componentType: T): ComponentFilter<T> => ({
    componentType,
    componentPredicate: getPredicate(),
  })
}
