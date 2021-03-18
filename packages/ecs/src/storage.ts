import { Archetype, ArchetypeSnapshot, createArchetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { assert } from "./debug"
import { applyMutation, createMutationCache } from "./mutation_cache"
import { createSignal, Signal } from "./signal"
import { mutableEmpty, packSparseArray } from "./util"

export type StorageSnapshot = {
  archetypes: ArchetypeSnapshot[]
}

export interface Storage {
  /**
   * The storage's underlying archetypes.
   */
  readonly archetypes: ReadonlyArray<Archetype>

  /**
   * Create a new entity.
   * @param entity Entity
   * @param components Array of components to associate with the entity
   */
  create(entity: number, components: Component[]): number

  /**
   * Associate components with an entity.
   * @param entity Entity
   * @param components Components to insert
   */
  insert(entity: number, components: Component[]): void

  /**
   * Update the value at a given path for a component.
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
   * @param entity Entity to insert components into.
   * @param components Components to either insert or update.
   */
  upsert(entity: number, components: Component[]): void

  /**
   * Remove components from an entity.
   * @param entity Entity to remove components from.
   * @param components Components to remove.
   */
  remove(entity: number, components: Component[]): void

  /**
   * Remove components from an entity via component type ids.
   * @param entity Entity to remove components from.
   * @param componentTypeIds Components to remove.
   */
  removeByTypeIds(entity: number, componentTypeIds: number[]): void

  /**
   * Destroy an entity.
   * @param entity Entity to destroy.
   */
  destroy(entity: number): void

  /**
   * Locate an entity's component by component type.
   * @param entity Entity to locate components of.
   * @param componentType ComponentType of component to retreive.
   */
  findComponent<T extends ComponentType>(
    entity: number,
    componentType: T,
  ): ComponentOf<T> | null

  /**
   * Locate an entity's component by component type id.
   *
   *  @param entity Entity to locate components of.
   * @param componentType ComponentType id of component to retreive.
   */
  findComponentByComponentTypeId<T extends ComponentType>(
    entity: number,
    componentTypeId: number,
  ): Component | null

  /**
   * Get all components for an entity.
   * @param entity Entity
   */
  getEntityComponents(entity: number): Component[]

  /**
   * Clear all component mutations.
   */
  clearMutations(): void

  /**
   * Retreive an observed copy of a component. Changes made to this component
   * can be retreived using getComponentMutations() and are cleared when
   * clearMutations() is called.
   * @param component Component
   */
  getObservedComponent<C extends Component>(component: C): C

  /**
   * Get the mutations made to a component. Mutations are currently stored in
   * a one-dimensional array with alternating key/value pairs.
   * @param component Component
   */
  getComponentMutations(component: Component): unknown[]

  /**
   * Determine a component has been changed since the last clearMutations()
   * call.
   * @param component Component to determine has been changed.
   */
  isComponentChanged(component: Component): boolean

  /**
   * Clear all storage data, including archetype data and component mutations.
   */
  clear(): void

  /**
   * Take a serializable snapshot of the storage.
   */
  snapshot(): StorageSnapshot

  /**
   * Signal dispatched with newly created archetypes immediately after they are created.
   */
  archetypeCreated: Signal<Archetype>
}

export type StorageOptions = {
  snapshot?: StorageSnapshot
}

export function createStorage(options: StorageOptions = {}): Storage {
  const archetypeCreated = createSignal<Archetype>()
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
  const archetypes: Archetype[] = options.snapshot
    ? options.snapshot.archetypes.map(snapshot => createArchetype({ snapshot }))
    : []
  // Array where the index corresponds to an entity and the value corresponds
  // to the index of the entity's archetype within the `archetypes` array. When
  // mutating or reading components, we always assume the location is valid
  // since it is kept in sync with the entity's archetype via the `create`,
  // `insert`, and `remove` methods.
  const archetypeIndicesByEntity: (number | null)[] = []

  /**
   * Locate an archetype which matches the signature of a collection of
   * components.
   * @param components Components that archetype would contain
   */
  function findArchetype(components: Component[]) {
    const componentsLength = components.length

    for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { signature } = archetype

      // Verify archetype has same number of components as predicate.
      if (signature.length !== componentsLength) {
        continue
      }

      let match = true

      for (let j = 0; j < componentsLength; j++) {
        if (signature.indexOf(components[j]._tid) === -1) {
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
   * @param components Components that archetype would contain
   */
  function findOrCreateArchetype(components: Component[]) {
    let archetype = findArchetype(components)

    if (!archetype) {
      archetype = createArchetype({
        signature: components.map(c => c._tid),
      })
      archetypes.push(archetype)
      archetypeCreated.dispatch(archetype)
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

    for (let i = 0; i < source.signature.length; i++) {
      const componentTypeId = source.signature[i]

      if (components.find(c => c._tid === componentTypeId)) {
        throw new Error(
          `Cannot attach component with type ${componentTypeId} — entity already has component of type.`,
        )
      }

      destinationComponents.push(source.table[i][entityIndex]!)
    }

    relocate(source, entity, destinationComponents)
  }

  function remove(entity: number, components: Component[]) {
    const typesToRemove = components.map(component => component._tid)

    removeByTypeIds(entity, typesToRemove)
  }

  function removeByTypeIds(entity: number, componentTypeIds: number[]) {
    const source = getEntityArchetype(entity)
    const entityIndex = source.indices[entity]

    let destinationComponents = []

    for (let i = 0; i < source.signature.length; i++) {
      const type = source.signature[i]
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
    remove(entity, getEntityComponents(entity))
    archetypeIndicesByEntity[entity] = null
  }

  function patch(
    entity: number,
    componentTypeId: number,
    path: string,
    value: unknown,
  ) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]
    const column = archetype.signatureInverse[componentTypeId]

    if (column === undefined) {
      return
    }

    const component = archetype.table[column][entityIndex]
    assert(
      component !== undefined,
      "Failed to patch component: entity does not exist in archetype",
    )

    applyMutation(getObservedComponent(component), path, value)
  }

  const tmpComponentsToInsert: Component[] = []

  function upsert(entity: number, components: Component[]) {
    const archetype = getEntityArchetype(entity)
    const entityIndex = archetype.indices[entity]

    mutableEmpty(tmpComponentsToInsert)

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const column = archetype.signatureInverse[component._tid]

      if (column === undefined) {
        // Entity component makeup does not match patch component, insert the new
        // component.
        tmpComponentsToInsert.push(component)
      } else {
        const target = getObservedComponent(
          archetype.table[column][entityIndex]!,
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
    return findComponentByComponentTypeId(
      entity,
      componentType.type,
    ) as ComponentOf<T>
  }

  function findComponentByComponentTypeId<T extends ComponentType>(
    entity: number,
    componentTypeId: number,
  ) {
    const archetype = getEntityArchetype(entity)
    const column = archetype.signatureInverse[componentTypeId]

    if (column === undefined) {
      return null
    }

    const entityIndex = archetype.indices[entity]

    return archetype.table[column][entityIndex]! as ComponentOf<T>
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

  function clearMutations() {
    mutations.forEach(mutableEmpty)
  }

  function getComponentMutations(component: Component) {
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

  function clear() {
    mutations.clear()
    mutableEmpty(archetypes)
    mutableEmpty(archetypeIndicesByEntity)
  }

  function snapshot() {
    return {
      archetypes: archetypes.map(archetype => ({
        signature: archetype.signature.slice(),
        table: archetype.table.map(column =>
          column.map(component => ({ ...component })),
        ),
        indices: packSparseArray(archetype.indices),
      })),
    }
  }

  return {
    archetypes,
    archetypeCreated,
    clear,
    clearMutations,
    create,
    destroy,
    findComponent,
    findComponentByComponentTypeId,
    getComponentMutations,
    getEntityComponents,
    getObservedComponent,
    insert,
    isComponentChanged,
    patch,
    remove,
    removeByTypeIds,
    snapshot,
    upsert,
  }
}
