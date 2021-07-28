import { PackedSparseArray, Schema, unpackSparseArray } from "@javelin/core"
import {
  Component,
  ComponentOf,
  getSchemaId,
  toComponentFromType,
} from "./component"
import { Entity } from "./entity"
import { normalizeType, Type } from "./type"

export type ComponentStoreColumn<S extends Schema> = ComponentOf<S>[]
export type ComponentStoreTable<S extends Schema[]> = {
  readonly [K in keyof S]: ComponentStoreColumn<
    S[K] extends Schema ? S[K] : never
  >
}

export type ComponentStore<$Signature extends Schema[]> = {
  /**
   * Two-dimensional array of component type->component[] where each index
   * (column) of the component array corresponds to an entity.
   * 
   *```
   *      (index)    0  1  2
   *     (entity)    1  3  9
   *   (Position) [[ p, p, p ]
   *   (Velocity) [  v, v, v ]]
   *```
   
   * The index of each entity is tracked in the `indices` array.
   */
  table: ComponentStoreTable<$Signature>

  /**
   * Array of entities tracked by this archetype. Not used internally:
   * primarily a convenience for iteration/checks by consumers.
   */
  entities: Entity[]

  /**
   * Array where each index corresponds to an entity, and each value
   * corresponds to that entity's index in the component table. In the example
   * above, this array might look like:
   *
   *```
   *           1         3            9
   *   [empty, 0, empty, 1, empty x5, 2]
   *```
   */
  indices: number[]

  /**
   * An array of schema ids that describes the type signature of an archetype.
   * The position of a schema id in this array is equivalent to the index of
   * the column where instances of that schema are stored.
   */
  type: Type
}

export type ReadonlyComponentStore<$Signature extends Schema[]> = {
  readonly [K in keyof ComponentStore<$Signature>]: Readonly<
    ComponentStore<$Signature>[K]
  >
}

/**
 * A JSON-serializable snapshot of an archetype. An archetype snapshot is
 * composed of a type signature, entities (in the form of a packed sparse-
 * array), and component data.
 */
export type ArchetypeSnapshot<$Signature extends Schema[] = Schema[]> = Pick<
  ComponentStore<$Signature>,
  "table" | "type"
> & {
  indices: PackedSparseArray<number>
}

/**
 * A collection of entities that share components of the same type.
 */
export type Archetype<$Signature extends Schema[] = Schema[]> =
  ReadonlyComponentStore<$Signature> & {
    /**
     * A flipped version of the archetype's signature where each index is a
     * schema id and the corresponding index is the schema's column index in
     * the component table.
     */
    readonly typeInverse: number[]

    /**
     * Insert an entity into the Archetype.
     * @param entity Subject entity
     * @param components Array of components
     * @returns void
     */
    insert(entity: Entity, components: Component[]): void

    /**
     * Remove an entity from the Archetype.
     * @param entity Subject entity
     * @returns void
     */
    remove(entity: Entity): void
  }

export type ArchetypeOptions<$Signature extends Schema[]> =
  | { type: number[] }
  | { snapshot: ArchetypeSnapshot<$Signature> }

function hydrateTableFromSnapshot<$Signature extends Schema[]>(
  table: ComponentStoreTable<Schema[]>,
  type: Type,
) {
  return table.map((column, i) => {
    const schemaId = type[i]
    return column
      .slice()
      .map(component => toComponentFromType(component, schemaId))
  }) as unknown as ComponentStoreTable<$Signature>
}

function createArchetypeStateFromSnapshot<$Signature extends Schema[]>(
  snapshot: ArchetypeSnapshot,
): ComponentStore<$Signature> {
  const entities = Object.keys(snapshot.indices).map(Number)
  const indices = unpackSparseArray(snapshot.indices)
  const type = normalizeType(snapshot.type)
  const table = hydrateTableFromSnapshot<$Signature>(snapshot.table, type)
  return { entities, indices, type, table }
}

function createStore<$Signature extends Schema[]>(
  options: ArchetypeOptions<$Signature>,
): ComponentStore<$Signature> {
  if ("snapshot" in options) {
    return createArchetypeStateFromSnapshot(options.snapshot)
  }
  const type = normalizeType(options.type)
  const table = type.map(() => []) as unknown as ComponentStoreTable<$Signature>
  return { entities: [], indices: [], type, table }
}

function invertSignature(signature: Type) {
  return signature.reduce((a, x, i) => {
    a[x] = i
    return a
  }, [] as number[])
}

/**
 * Create an Archetype.
 * @param signature
 * @param table
 */
export function createArchetype<$Signature extends Schema[]>(
  options: ArchetypeOptions<$Signature>,
): Archetype<$Signature> {
  const { table, indices, entities, type } = createStore<$Signature>(options)
  const typeInverse = invertSignature(type)

  function insert(entity: Entity, components: Component[]) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const schemaIndex = typeInverse[getSchemaId(component)]
      table[schemaIndex].push(component)
    }
    indices[entity] = entities.push(entity) - 1
  }

  function remove(entity: Entity) {
    const length = entities.length
    const index = indices[entity]
    const head = entities.pop()

    delete indices[entity]

    if (index === length - 1) {
      for (const column of table) column.pop()
    } else {
      for (const column of table) {
        column[index] = column.pop()!
      }
      entities[index] = head!
      indices[head!] = index
    }
  }

  return {
    entities,
    indices,
    insert,
    remove,
    type,
    typeInverse,
    table,
  }
}
