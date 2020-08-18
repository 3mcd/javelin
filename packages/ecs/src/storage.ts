import { Archetype, createArchetype } from "./archetype"
import {
  Component,
  ComponentOf,
  ComponentSpec,
  ComponentType,
} from "./component"
import { mutableEmpty } from "./util"

export interface Storage {
  /**
   * Create a new entity.
   *
   * @param entity Entity
   * @param components Array of components to associate with the entity
   */
  create(entity: number, components: ComponentSpec[]): number

  /**
   * Associate components with an entity.
   *
   * @param entity Entity
   * @param components Components to insert
   */
  insert(entity: number, components: ComponentSpec[]): void

  /**
   * Insert or update a component (e.g. from a remote source).
   *
   * @param component Latest copy of the component
   */
  upsert(entity: number, components: Component[]): void

  /**
   * Remove components from an entity.
   *
   * @param entity Entity
   * @param components Components to remove
   */
  remove(entity: number, components: ComponentSpec[]): void

  /**
   * Remove components from an entity by component type id.
   *
   * @param entity Entity
   * @param componentTypeIds Components to remove
   */
  removeByTypeIds(entity: number, componentTypeIds: number[]): void

  /**
   * Destroy an entity.
   *
   * @param entity Subject entity
   */
  destroy(entity: number): void

  /**
   * Increment the version of a component by 1 to indicate that it has been
   * modified.
   *
   * @param component Component to bump
   */
  incrementVersion(component: Component): void

  /**
   * Locate a component related to a specific entity.
   *
   * @param entity Subject entity
   * @param componentType Type of component to locate
   */
  findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T>

  /**
   * Get all components for an entity.
   *
   * @param entity Subject entity
   * @param componentType Type of component to locate
   */
  getEntityComponents(entity: number): Component[]

  /**
   * Collection of Archetypes in the world.
   */
  readonly archetypes: ReadonlyArray<Archetype>
}

function assertValidEntitylocation(
  location?: number | null,
): asserts location is number {
  if (location === undefined) {
    throw new Error(`Failed to locate entity. Entity does not exist.`)
  }

  if (location === null) {
    throw new Error(`Failed to locate entity. Entity has been removed.`)
  }
}

function assertValidComponentIndex(componentIndex: number) {
  if (componentIndex === -1) {
    throw new Error(
      "Failed to find component. Component could not exist with entity.",
    )
  }
}

function assertComponentTypeIdCanAttach(
  existingComponents: Component[],
  componentTypeId: number,
) {
  if (existingComponents.find(c => c._t === componentTypeId)) {
    throw new Error(
      `Cannot attach component with type ${componentTypeId} — entity already has component of type.`,
    )
  }
}

function assertComponentCanBeModified(component: Component) {
  if (component._v === -1) {
    throw new Error("Tried to modify detached component.")
  }
}

export function createStorage(): Storage {
  const archetypes: Archetype[] = []
  // Array where the index corresponds to an entity and the value corresponds
  // to the index of the entity's archetype within the `archetypes` array. When
  // mutating or reading components, we always assume the location is valid
  // since it is kept in sync with the entity's archetype via the `create`,
  // `insert`, and `remove` methods.
  const archetypeIndicesByEntity: (number | null)[] = []

  /**
   * Locate an archetype for a collection of components.
   *
   * @param components Components that archetype would contain
   */
  function findArchetype(components: Component[]) {
    const len = components.length

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { layout } = archetype

      // Verify archetype has same number of components as predicate.
      if (layout.length !== len) {
        continue
      }

      let match = true

      for (let j = 0; j < len; j++) {
        // Affirm that archetype contains each component of predicate.
        if (layout.indexOf(components[j]._t) === -1) {
          match = false
          break
        }
      }

      if (match) {
        return archetype
      }
    }

    return null
  }

  /**
   * Locate or create an archetype for a collection of components.
   *
   * @param components Components that archetype would contain
   */
  function findOrCreateArchetype(components: Component[]) {
    let archetype = findArchetype(components)

    if (!archetype) {
      archetype = createArchetype(components.map(c => c._t))
      archetypes.push(archetype)
    }

    return archetype
  }

  function create(entity: number, components: Component[]) {
    const archetype = findOrCreateArchetype(components)

    components.forEach(resetComponent)

    archetype.insert(entity, components)

    archetypeIndicesByEntity[entity] = archetypes.indexOf(archetype)

    return entity
  }

  function getEntityArchetype(entity: number) {
    const location = archetypeIndicesByEntity[entity]

    assertValidEntitylocation(location)

    return archetypes[location]
  }

  function relocate(
    source: Archetype,
    entity: number,
    components: Component[],
  ) {
    source.remove(entity)

    components.forEach(resetComponent)

    const destination = findOrCreateArchetype(components)

    destination.insert(entity, components)
    archetypeIndicesByEntity[entity] = archetypes.indexOf(destination)
  }

  function insert(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity)
    const entityIndex = source.indices[entity]

    let destinationComponents = components.slice() as Readonly<Component>[]

    for (let i = 0; i < source.layout.length; i++) {
      assertComponentTypeIdCanAttach(components, source.layout[i])
      // UNSAFE: `!` is used because entity location is non-null.
      destinationComponents.push(source.table[i][entityIndex]!)
    }

    relocate(source, entity, destinationComponents)
  }

  function remove(entity: number, components: Component[]) {
    const typesToRemove = components.map(component => component._t)

    removeByTypeIds(entity, typesToRemove)
  }

  function removeByTypeIds(entity: number, componentTypeIds: number[]) {
    const source = getEntityArchetype(entity)
    const entityIndex = source.indices[entity]

    let destinationComponents = []

    for (let i = 0; i < source.layout.length; i++) {
      const type = source.layout[i]
      const component = source.table[i][entityIndex]! as Component

      if (!componentTypeIds.includes(type)) {
        destinationComponents.push(component)
      }
    }

    relocate(source, entity, destinationComponents)
  }

  function destroy(entity: number) {
    const source = getEntityArchetype(entity)

    source.remove(entity)
    archetypeIndicesByEntity[entity] = null
  }

  function resetComponent(component: Component) {
    component._v = 0
  }

  function incrementVersion(component: Component) {
    assertComponentCanBeModified(component)
    component._v++
  }

  const tmpComponentsToInsert: Component[] = []

  function upsert(entity: number, components: Component[]) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const { _t: type } = component
      const componentIndex = archetype.layout.indexOf(type)

      if (componentIndex === -1) {
        // Entity component makeup does not match patch component, insert the new
        // component.
        tmpComponentsToInsert.push(component)
      } else {
        const targetComponent = archetype.table[componentIndex][entityIndex]!
        // Apply patch to component.
        Object.assign(targetComponent, component)
        incrementVersion(targetComponent)
      }
    }

    if (tmpComponentsToInsert.length > 0) {
      insert(entity, tmpComponentsToInsert)
    }

    mutableEmpty(tmpComponentsToInsert)
  }

  function findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ) {
    const archetype = getEntityArchetype(entity)
    const componentIndex = archetype.layout.indexOf(componentType.type)

    assertValidComponentIndex(componentIndex)

    const entityIndex = archetype.indices[entity]

    // UNSAFE: `!` is used because entity location is non-null.
    return archetype.table[componentIndex][entityIndex]! as ComponentOf<T>
  }

  function getEntityComponents(entity: number) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]
    const result: Component[] = []

    for (let i = 0; i < archetype.table.length; i++) {
      result.push(archetype.table[i][entityIndex]!)
    }

    return result
  }

  return {
    create,
    insert,
    remove,
    removeByTypeIds,
    destroy,
    archetypes,
    incrementVersion,
    findComponent,
    upsert,
    getEntityComponents,
  }
}
