import { Archetype, createArchetype } from "./archetype"
import {
  Component,
  ComponentOf,
  ComponentSpec,
  ComponentType,
} from "./component"
import { applyMutation, createMutationCache, Path } from "./mutation_cache"
import { Mutable } from "./types"
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
   * Update the value at a given path for a component.
   *
   * @param component Latest copy of the component
   */
  patch(
    entity: number,
    componentType: number,
    path: string,
    value: unknown,
  ): void

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

  clearMutations(): void

  getComponentMutations(component: Component): unknown[]

  getObservedComponent<C extends Component>(component: C): C

  isComponentChanged(component: Component): boolean

  /**
   * Collection of Archetypes in the world.
   */
  readonly archetypes: ReadonlyArray<Archetype>
}

export function createStorage(): Storage {
  const mutationCache = createMutationCache({
    onChange(component: Component, target, path, value, mutArrayMethodType) {
      let changes = mutations.get(component)

      if (!changes) {
        changes = []
        mutations.set(component, changes)
      }

      if (mutArrayMethodType) {
        changes.push(path, value, mutArrayMethodType)
      } else {
        changes.push(path, value)
      }
    },
  })
  const mutations = new Map<Component, unknown[]>()
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
        if (layout.indexOf(components[j].type) === -1) {
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
      archetype = createArchetype(components.map(c => c.type))
      archetypes.push(archetype)
    }

    return archetype
  }

  function create(entity: number, components: Component[]) {
    const archetype = findOrCreateArchetype(components)

    archetype.insert(entity, components)

    archetypeIndicesByEntity[entity] = archetypes.indexOf(archetype)

    return entity
  }

  function getEntityArchetype(entity: number) {
    const location = archetypeIndicesByEntity[entity]

    if (location === undefined) {
      throw new Error(`Failed to locate entity. Entity does not exist.`)
    }

    if (location === null) {
      throw new Error(`Failed to locate entity. Entity has been removed.`)
    }

    return archetypes[location]
  }

  function relocate(
    source: Archetype,
    entity: number,
    components: Component[],
  ) {
    source.remove(entity)

    if (components.length === 0) {
      return
    }

    const destination = findOrCreateArchetype(components)

    destination.insert(entity, components)
    archetypeIndicesByEntity[entity] = archetypes.indexOf(destination)
  }

  function insert(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity)
    const entityIndex = source.indices[entity]

    let destinationComponents = components.slice()

    for (let i = 0; i < source.layout.length; i++) {
      const componentTypeId = source.layout[i]

      if (components.find(c => c.type === componentTypeId)) {
        throw new Error(
          `Cannot attach component with type ${componentTypeId} — entity already has component of type.`,
        )
      }

      // UNSAFE: `!` is used because entity location is non-null.
      destinationComponents.push(source.table[i][entityIndex]!)
    }

    relocate(source, entity, destinationComponents)
  }

  function remove(entity: number, components: Component[]) {
    const typesToRemove = components.map(component => component.type)

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
      } else {
        mutationCache.revoke(component)
        mutations.delete(component)
      }
    }

    relocate(source, entity, destinationComponents)
  }

  function destroy(entity: number) {
    remove(entity, getComponentsOfEntity(entity))
    archetypeIndicesByEntity[entity] = null
  }

  function patch(
    entity: number,
    componentType: number,
    path: string,
    value: unknown,
  ) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]
    const componentIndex = archetype.layout.indexOf(componentType)

    if (componentIndex === -1) {
      return
    }

    const target = getObservedComponent(
      archetype.table[componentIndex][entityIndex]!,
    )

    applyMutation(target, path, value)
  }

  const tmpComponentsToInsert: Component[] = []

  function upsert(entity: number, components: Component[]) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]

    mutableEmpty(tmpComponentsToInsert)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentIndex = archetype.layout.indexOf(component.type)

      if (componentIndex === -1) {
        // Entity component makeup does not match patch component, insert the new
        // component.
        tmpComponentsToInsert.push(component)
      } else {
        const target = getObservedComponent(
          archetype.table[componentIndex][entityIndex]!,
        )
        // Apply patch to component.
        Object.assign(target, component)
      }
    }

    if (tmpComponentsToInsert.length > 0) {
      insert(entity, tmpComponentsToInsert)
    }
  }

  function findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ) {
    const archetype = getEntityArchetype(entity)
    const componentIndex = archetype.layout.indexOf(componentType.type)

    if (componentIndex === -1) {
      throw new Error(
        "Failed to find component. Component could not exist with entity.",
      )
    }

    const entityIndex = archetype.indices[entity]

    // UNSAFE: `!` is used because entity location is non-null.
    return archetype.table[componentIndex][entityIndex]! as ComponentOf<T>
  }

  function getComponentsOfEntity(entity: number) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]
    const result: Component[] = []

    for (let i = 0; i < archetype.table.length; i++) {
      result.push(archetype.table[i][entityIndex]!)
    }

    return result
  }

  function clearMutations() {
    mutations.forEach(mutableEmpty)
  }

  function getMutationsOfComponent(component: Component) {
    const changeSet = mutations.get(component)

    if (!changeSet) {
      throw new Error("ChangeSet does not exist for component.")
    }

    return changeSet
  }

  function getObservedComponent<C extends Component>(component: C) {
    return mutationCache.proxy(component) as C
  }

  function isComponentChanged(component: Component) {
    const changeSet = mutations.get(component)
    return changeSet ? changeSet.length > 0 : false
  }

  return {
    archetypes,
    clearMutations,
    create,
    destroy,
    findComponent,
    getComponentMutations: getMutationsOfComponent,
    getEntityComponents: getComponentsOfEntity,
    getObservedComponent,
    insert,
    isComponentChanged,
    patch,
    remove,
    removeByTypeIds,
    upsert,
  }
}
