import { Component } from "./component"
import { mutableRemoveUnordered } from "./util/array"

export interface Archetype {
  table: ReadonlyArray<ReadonlyArray<Readonly<Component>>>
  layout: ReadonlyArray<number>
  entities: ReadonlyArray<number>
  indices: ReadonlyArray<number>
  insert(entity: number, components: Component[]): void
  remove(entity: number): void
}

export function createArchetype(componentTypes: number[]): Archetype {
  const table: Readonly<Component>[][] = []
  const entities: number[] = []
  const indices: number[] = []
  const layout = componentTypes.slice().sort((a, b) => a - b)

  let head: number = -1

  for (let i = 0; i < layout.length; i++) {
    table[i] = []
  }

  function insert(entity: number, components: Component[]) {
    const next = head + 1

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      table[layout.indexOf(component._t)][next] = component
    }

    entities.push(entity)
    indices[entity] = next

    head = next
  }

  function remove(entity: number) {
    const index = indices[entity]

    indices[head] = index

    for (let i = 0; i < table.length; i++) {
      const components = table[i]
      components[index] = components[head]
    }

    mutableRemoveUnordered(entities, entity)
    head--
  }

  return {
    table,
    layout,
    indices,
    entities,
    insert,
    remove,
  }
}
