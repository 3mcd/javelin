import { Component, ComponentOf, ComponentType } from "./component"
import { Type } from "./type"
import { PackedSparseArray, unpackSparseArray } from "./util"

export type ArchetypeTableColumn<T extends ComponentType> = ComponentOf<T>[]
export type ArchetypeTable<T extends ComponentType[]> = {
  readonly [K in keyof T]: ArchetypeTableColumn<
    T[K] extends ComponentType ? T[K] : never
  >
}

export interface ArchetypeData<T extends ComponentType[]> {
  /**
   * Two-dimensional array of component type->component[] where each index
   * (column) of the component array corresponds to an entity.
   *
   *      (index)    0  1  2
   *     (entity)    1  3  9
   *   (Position) [[ p, p, p ]
   *   (Velocity) [  v, v, v ]]
   *
   * The index of each entity is tracked in the `indices` array.
   */
  readonly table: Readonly<ArchetypeTable<T>>

  /**
   * Array where each value is a component type and the index is the column of
   * the type's collection in the archetype table.
   */
  readonly signature: Type
}

export type ArchetypeSnapshot<
  T extends ComponentType[] = ComponentType[]
> = ArchetypeData<T> & {
  indices: PackedSparseArray<number>
}

/**
 * An Archetype is a collection of entities that share components of the same
 * type.
 */
export interface Archetype<T extends ComponentType[] = ComponentType[]>
  extends ArchetypeData<T> {
  /**
   * Insert an entity into the Archetype.
   *
   * @param entity Subject entity
   * @param components Array of components
   * @returns void
   */
  insert(entity: number, components: Component[]): void

  /**
   * Remove an entity from the Archetype.
   *
   * @param entity Subject entity
   * @returns void
   */
  remove(entity: number): void

  /**
   * Array where each index is a component type and the corresponding index is
   * the component type's column index in the component table.
   */
  readonly signatureInverse: ReadonlyArray<number>

  /**
   * Array of entities tracked by this archetype. Not used internally:
   * primarily a convenience for iteration/checks by consumers.
   */
  readonly entities: ReadonlyArray<number>

  /**
   * Array where each index corresponds to an entity, and each value
   * corresponds to that entity's index in the component table. In the example
   * above, this array might look like:
   *
   *           1         3            9
   *   [empty, 0, empty, 1, empty x5, 2]
   *
   */
  readonly indices: ReadonlyArray<number>
}

export type ArchetypeOptions<T extends ComponentType[]> =
  | {
      signature: number[]
    }
  | {
      snapshot: ArchetypeSnapshot<T>
    }

function createArchetypeState<T extends ComponentType[]>(
  options: ArchetypeOptions<T>,
) {
  const snapshot = "snapshot" in options ? options.snapshot : null
  const entities = snapshot ? Object.keys(snapshot.indices).map(Number) : []
  const indices = snapshot ? unpackSparseArray(snapshot.indices) : []
  const signature = ("signature" in options
    ? options.signature
    : options.snapshot.signature.slice()
  ).sort()
  const table = ((snapshot
    ? snapshot.table.map(column => column.slice())
    : signature.map(() => [])) as unknown) as ArchetypeTable<T>
  const signatureInverse = signature.reduce((a, x, i) => {
    a[x] = i
    return a
  }, [] as number[])

  return { entities, indices, signature, signatureInverse, table }
}

/**
 * Create an Archetype.
 *
 * @param signature Array of component types that make up the archetype
 * @param table  Initial component data
 */
export function createArchetype<T extends ComponentType[]>(
  options: ArchetypeOptions<T>,
): Archetype<T> {
  const {
    signature,
    signatureInverse,
    entities,
    indices,
    table,
  } = createArchetypeState<T>(options)

  function insert(entity: number, components: Component[]) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentTypeIndex = signatureInverse[component._tid]

      table[componentTypeIndex].push(component)
    }

    indices[entity] = entities.push(entity) - 1
  }

  function remove(entity: number) {
    const length = entities.length
    const index = indices[entity]
    const head = entities.pop()

    delete indices[entity]

    if (index === length - 1) {
      for (const column of table) column.pop()
      return
    }

    // Move leading entity's components to removed index position
    for (const column of table) {
      column[index] = column.pop()!
    }

    // Move leading entity to removed index position
    entities[index] = head!

    // Update previously leading entity's index
    indices[head!] = index
  }

  return {
    signature,
    signatureInverse,
    table,
    indices,
    entities,
    insert,
    remove,
  }
}
