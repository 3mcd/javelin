import { Archetype, createArchetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { applyMutation, createMutationCache } from "./mutation_cache"
import { mutableEmpty } from "./util"

export interface Storage {
  /**
   * Create a new entity.
   *
   * @param entity Entity
   * @param components Array of components to associate with the entity
   */
  create(entity: number, components: Component[]): number

  /**
   * Associate components with an entity.
   *
   * @param entity Entity
   * @param components Components to insert
   */
  insert(entity: number, components: Component[]): void

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
  remove(entity: number, components: Component[]): void

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
  ): ComponentOf<T> | null

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
  readonly archetypes: ReadonlyArray<Archetype<Component>>
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
  const archetypes: Archetype<Component>[] = []
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
    const length = components.length

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { layout } = archetype

      // Verify archetype has same number of components as predicate.
      if (layout.length !== length) {
        continue
      }

      let match = true

      for (let j = 0; j < length; j++) {
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

  const tmpInsertComponents: Component[] = []

  function insert(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity)
    const sourceComponents = source.get(entity)

    mutableEmpty(tmpInsertComponents)

    for (let i = 0; i < sourceComponents.length; i++) {
      tmpInsertComponents.push(sourceComponents[i])
    }

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentTypeId = component.type

      if (source.layout.includes(componentTypeId)) {
        throw new Error(
          `Cannot attach component with type ${componentTypeId}: entity already has component of type.`,
        )
      }

      tmpInsertComponents.push(components[i])
    }

    relocate(source, entity, tmpInsertComponents)
  }

  function remove(entity: number, components: Component[]) {
    const typesToRemove = components.map(component => component.type)

    removeByTypeIds(entity, typesToRemove)
  }

  function removeByTypeIds(entity: number, componentTypeIds: number[]) {
    const source = getEntityArchetype(entity)
    const sourceComponents = source.get(entity)

    mutableEmpty(tmpInsertComponents)

    for (let i = 0; i < sourceComponents.length; i++) {
      const component = sourceComponents[i]

      if (componentTypeIds.includes(component.type)) {
        mutationCache.revoke(component)
        mutations.delete(component)
      } else {
        tmpInsertComponents.push(component)
      }
    }

    relocate(source, entity, tmpInsertComponents)
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

    if (!archetype.has(entity)) {
      return
    }

    const target = getObservedComponent(
      archetype.getByType(entity, componentType),
    )

    applyMutation(target, path, value)
  }

  function upsert(entity: number, components: Component[]) {
    const archetype = getEntityArchetype(entity)

    mutableEmpty(tmpInsertComponents)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentTypeId = component.type

      if (archetype.indexByType[componentTypeId] === undefined) {
        // Entity component makeup does not match patch component, insert the new
        // component.
        tmpInsertComponents.push(component)
      } else {
        const target = getObservedComponent(
          archetype.getByType(entity, componentTypeId),
        )
        // Apply patch to component.
        Object.assign(target, component)
      }
    }

    if (tmpInsertComponents.length > 0) {
      insert(entity, tmpInsertComponents)
    }
  }

  function findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ) {
    const archetype = getEntityArchetype(entity)
    return archetype.getByType(entity, componentType.type) as ComponentOf<T>
  }

  function getComponentsOfEntity(entity: number) {
    const archetype = getEntityArchetype(entity)
    return archetype.get(entity) as Component[]
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
