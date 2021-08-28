import { assert, mutableEmpty, packSparseArray, Schema } from "@javelin/core"
import { Archetype, ArchetypeSnapshot, createArchetype } from "./archetype"
import { Component, ComponentOf, getSchemaId } from "./component"
import { Entity } from "./entity"
import { UNSAFE_internals } from "./internal"
import { createSignal, Signal } from "./signal"
import { Type } from "./type"

const ERROR_ENTITY_NOT_CREATED =
  "Failed to locate entity: entity has not been created"
const ERROR_ALREADY_DESTROYED =
  "Failed to locate entity: entity has been destroyed"
const ERROR_NO_SCHEMA = "Failed to locate component: schema not registered"

export type StorageSnapshot = {
  archetypes: ArchetypeSnapshot[]
}

export type Storage = {
  /**
   * Archetype table.
   */
  readonly archetypes: ReadonlyArray<Archetype>

  /**
   * Signal dispatched with newly created archetypes immediately after they are created.
   */
  readonly archetypeCreated: Signal<Archetype>

  /**
   * Signal dispatched when an entity begins transitioning between archetypes.
   */
  readonly entityRelocating: Signal<Entity, Archetype, Archetype, Component[]>

  /**
   * Signal dispatched when an entity transitions between archetypes.
   */
  readonly entityRelocated: Signal<Entity, Archetype, Archetype, Component[]>

  /**
   * Attach components to an entity.
   * @param entity
   * @param components
   */
  attachComponents(entity: Entity, components: Component[]): void

  /**
   * Attach or update an entity's components.
   * @param entity
   * @param components
   */
  attachOrUpdateComponents(entity: Entity, components: Component[]): void

  /**
   * Detach components from an entity via schema ids.
   * @param entity
   * @param type
   */
  detachBySchemaId(entity: Entity, type: number[]): void

  /**
   * Remove all components from an entity.
   * @param entity
   */
  clearComponents(entity: Entity): void

  /**
   * Check if an entity has a component of a particular schema.
   * @param entity
   * @param schema
   */
  hasComponentOfSchema(entity: Entity, schema: Schema): boolean

  /**
   * Locate an entity's component by schema.
   * @param entity
   * @param schema
   */
  getComponentBySchema<$Schema extends Schema>(
    entity: Entity,
    schema: $Schema,
  ): ComponentOf<$Schema> | null

  /**
   * Locate an entity's component by schema id.
   * @param entity
   * @param schema
   */
  getComponentBySchemaId(entity: Entity, schemaId: number): Component | null

  /**
   * Get all components of an entity.
   * @param entity
   */
  getAllComponents(entity: Entity): Component[]

  /**
   * Clear all entity-component data.
   */
  clear(): void

  /**
   * Create a JSON-serializable snapshot of the storage instance.
   */
  createSnapshot(): StorageSnapshot
}

export type StorageOptions = {
  snapshot?: StorageSnapshot
}

export function createStorage(options: StorageOptions = {}): Storage {
  const archetypes: Archetype[] = options.snapshot
    ? options.snapshot.archetypes.map(snapshot => createArchetype({ snapshot }))
    : [createArchetype({ type: [] })]
  const entityIndex: (Archetype | null)[] = []
  const entityRelocating = createSignal<
    Entity,
    Archetype,
    Archetype,
    Component[]
  >()
  const entityRelocated = createSignal<
    Entity,
    Archetype,
    Archetype,
    Component[]
  >()
  const archetypeCreated = createSignal<Archetype>()

  function findArchetype(components: Component[]) {
    const length = components.length
    outer: for (let i = 0; i < archetypes.length; i++) {
      const archetype = archetypes[i]
      const { type, typeInverse } = archetype
      if (type.length !== length) {
        continue
      }
      for (let j = 0; j < length; j++) {
        if (typeInverse[getSchemaId(components[j])] === undefined) {
          continue outer
        }
      }
      return archetype
    }
    return null
  }

  function findOrCreateArchetype(components: Component[]) {
    let archetype = findArchetype(components)
    if (archetype === null) {
      archetype = createArchetype({
        type: components.map(getSchemaId),
      })
      archetypes.push(archetype)
      archetypeCreated.dispatch(archetype)
    }
    return archetype
  }

  function getEntityArchetype(entity: Entity) {
    const archetype = entityIndex[entity]
    assert(archetype !== undefined, ERROR_ENTITY_NOT_CREATED)
    assert(archetype !== null, ERROR_ALREADY_DESTROYED)
    return archetype
  }

  function relocate(
    prev: Archetype,
    entity: Entity,
    components: Component[],
    changed: Component[],
  ) {
    const next = findOrCreateArchetype(components)
    entityRelocating.dispatch(entity, prev, next, changed)
    prev.remove(entity)
    next.insert(entity, components)
    entityIndex[entity] = next
    entityRelocated.dispatch(entity, prev, next, changed)
  }

  function attachComponents(entity: Entity, components: Component[]) {
    const source = entityIndex[entity]
    if (source === undefined || source === null) {
      const archetype = findOrCreateArchetype(components)
      entityRelocating.dispatch(entity, archetypes[0], archetype, components)
      archetype.insert(entity, components)
      entityIndex[entity] = archetype
      entityRelocated.dispatch(entity, archetypes[0], archetype, components)
    } else {
      const index = source.indices[entity]
      const final = components.slice()
      for (let i = 0; i < source.type.length; i++) {
        const schemaId = source.type[i]
        if (components.find(c => getSchemaId(c) === schemaId)) {
          // take inserted component
          continue
        }
        final.push(source.table[i][index])
      }
      relocate(source, entity, final, components)
    }
  }

  function detachBySchemaId(entity: Entity, type: Type) {
    const source = getEntityArchetype(entity)
    const removed: Component[] = []
    const final: Component[] = []
    const index = source.indices[entity]
    for (let i = 0; i < source.type.length; i++) {
      const schemaId = source.type[i]
      const component = source.table[i][index]! as Component
      ;(type.includes(schemaId) ? removed : final).push(component)
    }
    relocate(source, entity, final, removed)
  }

  function clearComponents(entity: Entity) {
    const archetype = getEntityArchetype(entity)
    detachBySchemaId(entity, archetype.type)
    entityIndex[entity] = null
  }

  const tmpComponentsToInsert: Component[] = []

  function attachOrUpdateComponents(entity: Entity, components: Component[]) {
    const archetype = getEntityArchetype(entity)
    const index = archetype.indices[entity]
    mutableEmpty(tmpComponentsToInsert)
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const column = archetype.typeInverse[getSchemaId(component)]
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
      attachComponents(entity, tmpComponentsToInsert)
    }
  }

  function hasComponentOfSchema(entity: Entity, schema: Schema) {
    const archetype = getEntityArchetype(entity)
    const type = UNSAFE_internals.schemaIndex.get(schema)
    assert(type !== undefined, ERROR_NO_SCHEMA)
    return archetype.type.includes(type)
  }

  function getComponentBySchema<T extends Schema>(entity: Entity, schema: T) {
    const type = UNSAFE_internals.schemaIndex.get(schema)
    assert(type !== undefined, ERROR_NO_SCHEMA)
    return getComponentBySchemaId(entity, type) as ComponentOf<T>
  }

  function getComponentBySchemaId<T extends Schema>(
    entity: Entity,
    schemaId: number,
  ) {
    const archetype = getEntityArchetype(entity)
    const column = archetype.typeInverse[schemaId]
    if (column === undefined) {
      return null
    }
    const entityIndex = archetype.indices[entity]
    return archetype.table[column][entityIndex]! as ComponentOf<T>
  }

  function getAllComponents(entity: Entity) {
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

  function createSnapshot() {
    return {
      archetypes: archetypes.map(archetype => ({
        type: archetype.type.slice(),
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
    attachComponents,
    attachOrUpdateComponents,
    clear,
    clearComponents,
    detachBySchemaId,
    entityRelocated,
    entityRelocating,
    getComponentBySchemaId,
    getComponentBySchema,
    getAllComponents,
    createSnapshot,
    hasComponentOfSchema,
  }
}
