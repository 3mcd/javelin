import { Archetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { ComponentFilter, ComponentFilterPredicate } from "./filter"
import { createStackPool } from "./pool"
import { mutableEmpty } from "./util/array"
import { World } from "./world"

export type Selector = (ComponentType | ComponentFilter)[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends ComponentFilter
    ? ComponentOf<S[K]["componentType"]>
    : S[K] extends ComponentType
    ? ComponentOf<S[K]>
    : never
}
export type Query<S extends Selector> = (
  world: World,
) => {
  [Symbol.iterator](): {
    next(): IteratorYieldResult<QueryResult<S>>
  }
}
export type QueryResult<S extends Selector> = [number, SelectorResult<S>]

class QueryIterable<S extends Selector = Selector>
  implements Iterable<QueryResult<S>> {
  private queryLength: number = -1
  private queryLayout: number[] = []
  private componentFilterPredicates: (ComponentFilterPredicate | null)[] = []
  private queryResult: [number, SelectorResult<S>] = [
    -1,
    [] as SelectorResult<S>,
  ]
  private readIndices: number[] = []
  private iterable: {
    next(): IteratorYieldResult<QueryResult<S>>
  }

  private onDone: ((q: this) => void) | null = null
  private _onDone = () => this.onDone!(this)

  // iterator state
  private world: World | null = null
  private iteratorResult: IteratorYieldResult<QueryResult<S>>
  private entityIndex: number = -1
  private archetypeIndex: number = -1
  private currentArchetype: Archetype | null = null

  constructor(selector: S) {
    this.componentFilterPredicates = selector.map(s =>
      "componentPredicate" in s ? s.componentPredicate : null,
    )
    this.queryLayout = selector.map(s =>
      "componentType" in s ? s.componentType.type : s.type,
    )
    this.queryLength = selector.length
    this.iterable = {
      next: this.next,
    }
    this.iteratorResult = {
      value: this.queryResult,
      done: false,
    }
  }

  reset() {
    this.entityIndex = -1
    this.archetypeIndex = -1
    this.currentArchetype = null
    this.queryResult[0] = -1
    this.iteratorResult.done = false
  }

  next = (): IteratorYieldResult<QueryResult<S>> => {
    if (this.currentArchetype === null) {
      this.visitNextArchetype()
    } else {
      this.visitNextEntity()
    }

    return this.iteratorResult
  }

  visitNextArchetype() {
    const { queryLayout, queryLength, readIndices, world } = this

    outer: while (
      (this.currentArchetype = world!.storage.archetypes[++this.archetypeIndex])
    ) {
      const { layoutInverse } = this.currentArchetype!

      for (let i = 0; i < queryLength; i++) {
        const index = layoutInverse[queryLayout[i]]

        if (index === undefined) {
          continue outer
        }

        readIndices[i] = index
      }

      this.entityIndex = -1
      this.visitNextEntity()

      return
    }

    ;(this.iteratorResult as any).done = true
    setTimeout(this._onDone)
  }

  visitNextEntity() {
    const {
      currentArchetype,
      readIndices,
      componentFilterPredicates,
      world,
    } = this
    const { table, entities } = currentArchetype!
    const length = entities.length

    outer: while (++this.entityIndex < length) {
      this.queryResult[0] = entities[this.entityIndex]

      for (let i = 0; i < this.queryLength; i++) {
        const component = table[readIndices[i]][this.entityIndex]!

        if (
          componentFilterPredicates[i]?.(component, world!) ??
          component._cst === 2
        ) {
          ;(this.queryResult[1] as Component[])[i] = component
        } else {
          continue outer
        }
      }

      return
    }

    this.visitNextArchetype()
  }

  [Symbol.iterator]() {
    return this.iterable
  }

  init(world: World, onDone: (q: this) => void) {
    this.world = world
    this.onDone = onDone
  }
}

/**
 * Create a Query with a given set of component types.
 *
 * @param selector Component makeup of entities
 */
export function query<S extends Selector>(...selector: S): Query<S> {
  const pool = createStackPool(
    () => new QueryIterable(selector),
    q => {
      q.reset()
      return q
    },
    100,
  )

  return (world: World) => {
    const query = pool.retain()

    query.init(world, pool.release)

    return query
  }
}
