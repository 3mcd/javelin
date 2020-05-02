import { Archetype } from "./archetype"
import { ComponentsOf, ComponentSpec } from "./component"
import { Storage } from "./storage"
import { arrayOf } from "./util/array"

export interface QueryLike<T extends ComponentSpec[]> {
  run(storage: Storage, queryHandler: (...args: any[]) => void): void
}

export class Query<T extends ComponentSpec[]> implements QueryLike<T> {
  private selectorLength: number
  private tmpResult: ComponentsOf<T>
  private tmpReadIndices: number[] = []
  private queryLayout: number[]
  private componentTypes: number[]

  constructor(componentSpecs: ComponentSpec[]) {
    this.selectorLength = componentSpecs.length
    this.tmpResult = arrayOf(this.selectorLength) as ComponentsOf<T>
    this.queryLayout = componentSpecs.map(s => s.type)
    this.componentTypes = componentSpecs.map(s => s.type)
  }

  *run(storage: Storage) {
    for (const archetype of storage.getArchetypes(this.componentTypes)) {
      // Calculate the index of each outgoing component.
      for (let i = 0; i < this.selectorLength; i++) {
        this.tmpReadIndices[i] = (archetype as Archetype).layout.indexOf(
          this.queryLayout[i],
        )
      }

      for (let i = 0; i < archetype.entities.length; i++) {
        const entity = archetype.entities[i]
        const index = archetype.indices[entity]

        for (let j = 0; j < this.componentTypes.length; j++) {
          this.tmpResult[j] = archetype.table[this.tmpReadIndices[j]][index]!
        }

        yield this.tmpResult
      }
    }
  }
}
