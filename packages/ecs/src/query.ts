import { Archetype } from "./archetype"
import { ComponentsOf, ComponentSpec } from "./component"
import { FilterLike } from "./filter"
import { Tag } from "./filters/tag"
import { Storage } from "./storage"
import { arrayOf } from "./util/array"

export interface QueryLike<T extends ComponentSpec[]> {
  filter(...filters: (FilterLike | number)[]): QueryLike<T>
  run(storage: Storage): IterableIterator<ComponentsOf<T>>
}

export class Query<T extends ComponentSpec[]> implements QueryLike<T> {
  private selectorLength: number
  private filters = arrayOf<FilterLike>()
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

  filter(...filters: (FilterLike | number)[]) {
    for (let i = 0; i < filters.length; i++) {
      const f = filters[i]
      if (typeof f === "number") {
        this.filters.push(new Tag(f))
      } else {
        this.filters.push(f)
      }
    }

    return this
  }

  *run(storage: Storage) {
    for (const archetype of storage.getArchetypes(this.componentTypes)) {
      // Calculate the index of each outgoing component.
      for (let i = 0; i < this.selectorLength; i++) {
        this.tmpReadIndices[i] = (archetype as Archetype).layout.indexOf(
          this.queryLayout[i],
        )
      }
      for (const components of (archetype as Archetype).read(this.filters)) {
        for (let k = 0; k < this.selectorLength; k++) {
          this.tmpResult[k] = components[this.tmpReadIndices[k]]
        }
        yield this.tmpResult
      }
    }
  }
}
