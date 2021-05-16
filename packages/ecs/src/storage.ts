import { assert, mutableEmpty, packSparseArray, Schema } from "@javelin/core"
import { Archetype, ArchetypeSnapshot, createArchetype } from "./archetype"
import { Component, ComponentOf } from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
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
   * Remove components from an entity via schema ids.
   * @param entity Entity to remove components from.
   * @param schemaIds Components to remove.
   */
  remove(entity: number, schemaIds: number[]): void

  /**
   * Destroy an entity.
   * @param entity Entity to destroy.
   */
  destroy(entity: number): void

  /**
   * Determine if an entity has a component.
   * @param entity
   * @param schema
   */
  hasComponent(entity: number, schema: Schema): boolean

  /**
   * Locate an entity's component by schema.
   * @param entity Entity to locate components of.
   * @param schema Schema of component to retreive.
   */
  findComponent<S extends Schema>(
    entity: number,
    schema: S,
  ): ComponentOf<S> | null

  /**
   * Locate an entity's component by schema id.
   *
   *  @param entity Entity to locate components of.
   * @param schema Schema id of component to retreive.
   */
  findComponentBySchemaId(entity: number, schemaId: number): Component | null

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
  readonly entityRelocated: Signal<Entity, Archetype, Archetype, Component[]>
}

export type StorageOptions = {
  snapshot?: StorageSnapshot
}

const ERROR_ENTITY_NOT_CREATED =
  "Failed to locate entity: entity has not been created"
const ERROR_ALREADY_DESTROYED =
  "Failed to locate entity: entity has been destroyed"
const ERROR_NO_SCHEMA = "Failed to locate component: schema not registered"

export function createStorage(options: StorageOptions = {}): Storage {
  const archetypeCreated = createSignal<Archetype>()
  const entityRelocated = createSignal<
    Entity,
    Archetype,
    Archetype,
    Component[]
  >()
  const archetypes: Archetype[] = options.snapshot
    ? options.snapshot.archetypes.map(snapshot => createArchetype({ snapshot }))
    : [createArchetype({ signature: [] })]
  // Array where the index corresponds to an entity and the value corresponds
  // to the index of the entity's archetype within the `archetypes` array. When
  // mutating or reading components, we always assume the location is valid
  // since it is kept in sync with the entity's archetype via the `create`,
  // `insert`, and `remove` methods.
  const entityIndex: (Archetype | null)[] = []

  /**
   * Locate an archetype which matches the signature of a collection of
   * components.
   * @param components Components that archetype would contain
   */
  function findArchetype(components: Component[]) {
    const length = components.length
    outer: for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { signature, signatureInverse } = archetype
      if (signature.length !== length) {
        continue
      }
      for (let j = 0; j < length; j++) {
        if (signatureInverse[components[j].__type__] === undefined) {
          continue outer
        }
      }
      return archetype
    }
    return null
  }

  /**
   * Locate or create an archetype for a collection of components.
   * @param components Components that archetype would contain
   */
  function findOrCreateArchetype(components: Component[]) {
    let archetype = findArchetype(components)
    if (archetype === null) {
      archetype = createArchetype({
        signature: components.map(c => c.__type__),
      })
      archetypes.push(archetype)
      archetypeCreated.dispatch(archetype)
    }
    return archetype
  }

  function create(entity: number, components: Component[]) {
    const archetype = findOrCreateArchetype(components)
    archetype.insert(entity, components)
    entityIndex[entity] = archetype
    entityRelocated.dispatch(entity, archetypes[0], archetype, components)
    return entity
  }

  function getEntityArchetype(entity: number) {
    const archetype = entityIndex[entity]
    assert(archetype !== undefined, ERROR_ENTITY_NOT_CREATED)
    assert(archetype !== null, ERROR_ALREADY_DESTROYED)
    return archetype
  }

  function relocate(
    source: Archetype,
    entity: number,
    components: Component[],
    changed: Component[],
  ) {
    const dest = findOrCreateArchetype(components)
    source.remove(entity)
    dest.insert(entity, components)
    entityIndex[entity] = dest
    entityRelocated.dispatch(entity, source, dest, changed)
  }

  function insert(entity: number, components: Component[]) {
    const source = getEntityArchetype(entity)
    const index = source.indices[entity]
    const final = components.slice()
    for (let i = 0; i < source.signature.length; i++) {
      const schemaId = source.signature[i]
      if (components.find(c => c.__type__ === schemaId)) {
        // take inserted component
        continue
      }
      final.push(source.table[i][index])
    }
    relocate(source, entity, final, components)
  }

  function remove(entity: number, schemaIds: number[]) {
    const source = getEntityArchetype(entity)
    const index = source.indices[entity]
    const final: Component[] = []
    const removed: Component[] = []
    for (let i = 0; i < source.signature.length; i++) {
      const type = source.signature[i]
      const component = source.table[i][index]! as Component
      ;(schemaIds.includes(type) ? removed : final).push(component)
    }
    relocate(source, entity, final, removed)
  }

  function destroy(entity: number) {
    const archetype = getEntityArchetype(entity)
    remove(entity, archetype.signature)
    entityIndex[entity] = null
  }

  const tmpComponentsToInsert: Component[] = []

  function upsert(entity: number, components: Component[]) {
    const archetype = getEntityArchetype(entity)
    const index = archetype.indices[entity]
    mutableEmpty(tmpComponentsToInsert)
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const column = archetype.signatureInverse[component.__type__]
      if (column === undefined) {
        // Entity component makeup does not match patch component, insert the new
        // component.
        tmpComponentsToInsert.push(component)
      } else {
        // Apply patch to component.
        Object.assign(archetype.table[column][index], component)
      }
    }
    if (tmpComponentsToInsert.length > 0) {
      insert(entity, tmpComponentsToInsert)
    }
  }

  function hasComponent(entity: number, schema: Schema) {
    const archetype = getEntityArchetype(entity)
    const type = UNSAFE_internals.schemaIndex.get(schema)
    assert(type !== undefined, ERROR_NO_SCHEMA)
    return archetype.signature.includes(type)
  }

  function findComponent<T extends Schema>(entity: number, schema: T) {
    const type = UNSAFE_internals.schemaIndex.get(schema)
    assert(type !== undefined, ERROR_NO_SCHEMA)
    return findComponentBySchemaId(entity, type) as ComponentOf<T>
  }

  function findComponentBySchemaId<T extends Schema>(
    entity: number,
    schemaId: number,
  ) {
    const archetype = getEntityArchetype(entity)
    const column = archetype.signatureInverse[schemaId]
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
    mutableEmpty(entityIndex)
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
    findComponentBySchemaId,
    getEntityComponents,
    hasComponent,
    insert,
    remove,
    snapshot,
    upsert,
  }
}
