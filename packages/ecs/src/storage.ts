import { mutableEmpty, packSparseArray } from "@javelin/model"
import { Archetype, ArchetypeSnapshot, createArchetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { Entity } from "./entity"
import { createSignal, Signal } from "./signal"

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
   * Determine if an entity has a component.
   * @param entity
   * @param componentType
   */
  hasComponent(entity: number, componentType: ComponentType): boolean

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
  readonly archetypeCreated: Signal<Archetype>

  /**
   * Signal dispatched when an entity transitions between archetypes.
   */
  readonly entityRelocated: Signal<Entity, Archetype, Archetype>
}

export type StorageOptions = {
  snapshot?: StorageSnapshot
}

export function createStorage(options: StorageOptions = {}): Storage {
  const archetypeCreated = createSignal<Archetype>()
  const entityRelocated = createSignal<Entity, Archetype, Archetype>()
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

    const destination = findOrCreateArchetype(components)

    destination.insert(entity, components)
    archetypeIndicesByEntity[entity] = archetypes.indexOf(destination)
    entityRelocated.dispatch(entity, source, destination)
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
      }
    }

    relocate(source, entity, destinationComponents)
  }

  function destroy(entity: number) {
    remove(entity, getEntityComponents(entity))
    archetypeIndicesByEntity[entity] = null
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
        // Apply patch to component.
        Object.assign(archetype.table[column][entityIndex]!, component)
      }
    }

    if (tmpComponentsToInsert.length > 0) {
      insert(entity, tmpComponentsToInsert)
    }
  }

  function hasComponent(entity: number, componentType: ComponentType) {
    const archetype = getEntityArchetype(entity)
    return archetype.signature.includes(componentType.type)
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

  function clear() {
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
    archetypeCreated,
    archetypes,
    clear,
    create,
    destroy,
    entityRelocated,
    findComponent,
    findComponentByComponentTypeId,
    getEntityComponents,
    hasComponent,
    insert,
    remove,
    removeByTypeIds,
    snapshot,
    upsert,
  }
}
