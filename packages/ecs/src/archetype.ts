import { Component } from "./component"

/**
 * An Archetype is a collection of entities that share components of the same
 * type.
 */
export interface Archetype {
  // Two-dimensional array of component type->component[] where each index
  // (column) of the component array corresponds to an entity.
  //
  //      (index)    0  1  2
  //     (entity)    1  3  9
  //   (Position) [[ p, p, p ]
  //   (Velocity) [  v, v, v ]]
  //
  // The index of each entity is tracked in the `indices array`.
  table: ReadonlyArray<ReadonlyArray<Readonly<Component | null>>>
  // Array where each value is a component type and the index is the column of
  // the type's collection in the archetype table.
  layout: ReadonlyArray<number>
  // Array of entities tracked by this archetype. Not used internally:
  // primarily a convenience for iteration/checks by consumers.
  entities: ReadonlyArray<number>
  // Array where each index corresponds to an entity, and each value
  // corresponds to that entity's index in the component table. In the example
  // above, this array might look like:
  //
  //           1         3            9
  //   [empty, 0, empty, 1, empty x5, 2]
  //
  indices: ReadonlyArray<number>
  /**
   * Insert an entity into the Archetype.
   *
   * @param entity Entity to associate components with
   * @param components Array of components
   * @returns void
   */
  insert(entity: number, components: Component[]): void
  /**
   * Remove an entity from the Archetype.
   *
   * @param entity Entity to associate components with
   * @returns void
   */
  remove(entity: number): void
}

/**
 * Create an Archetype.
 *
 * @param layout Array of component types that make up the archetype
 */
export function createArchetype(layout: number[]): Archetype {
  const len = layout.length
  const table: Readonly<Component | null>[][] = []
  const entities: number[] = []
  const indices: number[] = []

  // Initialize the table with an empty collection of components for each
  // component type.
  for (let i = 0; i < len; i++) {
    table[i] = []
  }

  let head = -1

  function insert(entity: number, components: Component[]) {
    head++
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      table[layout.indexOf(component._t)][head] = component
    }
    entities[head] = entity
    indices[entity] = head
  }

  let index

  function remove(entity: number) {
    index = indices[entity]

    if (index === head) {
      for (const components of table) components[head] = null
    } else {
      for (const components of table) {
        // Overwrite the entity with the head entity's component.
        components[index] = components[head]
        // Unset the head entity's component. Unnecessary since the component
        // reference would be overwritten on the next insert, but we unset it
        // anyways for clarity.
        components[head] = null
      }
    }

    // Overwrite the removed entity position and index with the leading entity.
    entities[index] = entities[head]
    indices[entities[head]] = index
    indices[entity] = -1

    // Remove the duplicate copied entity.
    entities.pop()

    head--
  }

  return {
    layout,
    table,
    indices,
    entities,
    insert,
    remove,
  }
}
