import { Component } from "./component"

/**
 * An Archetype is a collection of entities that share components of the same
 * type.
 */
export interface Archetype {
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
  readonly table: ReadonlyArray<ReadonlyArray<Component | null>>

  /**
   * Array where each value is a component type and the index is the column of
   * the type's collection in the archetype table.
   */
  readonly layout: ReadonlyArray<number>

  /**
   * Array where each index is a component type and the corresponding index is
   * the component type's column index in the component table.
   */
  readonly layoutInverse: ReadonlyArray<number>

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

/**
 * Create an Archetype.
 *
 * @param layout Array of component types that make up the archetype
 */
export function createArchetype(layout: number[]): Archetype {
  const len = layout.length
  const table: (Component | null)[][] = []
  const entities: number[] = []
  const indices: number[] = []
  const layoutInverse = layout.reduce((a, x, i) => {
    a[x] = i
    return a
  }, [] as number[])

  // Initialize the table with an empty collection of components for each
  // component type.
  for (let i = 0; i < len; i++) {
    table[i] = []
  }

  function insert(entity: number, components: Component[]) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const componentTypeIndex = layoutInverse[component.tid]

      table[componentTypeIndex].push(component)
    }

    indices[entity] = entities.push(entity) - 1
  }

  function remove(entity: number) {
    const length = entities.length
    const index = indices[entity]
    const head = entities.pop()

    indices[entity] = -1

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
    layout,
    layoutInverse,
    table,
    indices,
    entities,
    insert,
    remove,
  }
}
