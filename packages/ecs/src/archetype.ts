import { Component } from "./component"
import { mutableRemoveUnordered } from "./util/array"

export class Archetype {
  readonly layout: number[]
  readonly table: Readonly<Component>[][] = []

  entities: number[] = []
  indices: number[] = []
  head: number = -1

  constructor(componentTypes: number[]) {
    this.layout = componentTypes.slice().sort((a, b) => a - b)

    for (let i = 0; i < this.layout.length; i++) {
      this.table[i] = []
    }
  }

  insert(entity: number, components: Component[]) {
    const next = this.head + 1

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      this.table[this.layout.indexOf(component._t)][next] = component
    }

    this.entities.push(entity)
    this.indices[entity] = next

    this.head = next

    return entity
  }

  swap(entity: number, dest: Archetype) {
    // TODO
  }

  remove(entity: number) {
    const index = this.indices[entity]

    this.indices[this.head] = index

    for (let i = 0; i < this.table.length; i++) {
      const components = this.table[i]
      components[index] = components[this.head]
    }

    mutableRemoveUnordered(this.entities, entity)
    this.head--
  }
}
