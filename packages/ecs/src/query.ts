import { Archetype } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { ComponentFilter, ComponentFilterPredicate } from "./filter"
import { globals } from "./internal/globals"
import { createStackPool } from "./pool"

export type Selector = (ComponentType | ComponentFilter)[]
export type SelectorResult<S extends Selector> = {
  [K in keyof S]: S[K] extends ComponentFilter
    ? ComponentOf<S[K]["componentType"]>
    : S[K] extends ComponentType
    ? ComponentOf<S[K]>
    : Component
}
export type Query<S extends Selector> = {
  [Symbol.iterator](): {
    next(): IteratorYieldResult<QueryResult<S>>
  }
}
export type QueryResult<S extends Selector> = [number, ...SelectorResult<S>]

class QueryIterable<S extends Selector = Selector> {
  private queryLength: number = -1
  private queryLayout: number[] = []
  private componentFilterPredicates: (ComponentFilterPredicate | null)[] = []
  private queryResult: QueryResult<S> = ([-1] as unknown) as QueryResult<S>
  private readIndices: number[] = []

  private onDone: ((q: this) => void) | null = null
  private onDoneBound = () => this.onDone!(this)

  // iterator state
  private iteratorResult: IteratorYieldResult<QueryResult<S>>
  private entityIndex: number = -1
  private archetypeIndex: number = -1
  private currentArchetype: Archetype | null = null

  readonly iterable: {
    next(): IteratorYieldResult<QueryResult<S>>
  }

  constructor(selector: S, onDone: (q: QueryIterable<S>) => void) {
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
    this.onDone = onDone
  }

  reset() {
    this.entityIndex = -1
    this.archetypeIndex = -1
    this.currentArchetype = null
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
    const { queryLayout, queryLength, readIndices } = this

    outer: while (
      (this.currentArchetype = globals.__WORLDS__[
        globals.__CURRENT_WORLD__
      ]!.storage.archetypes[++this.archetypeIndex])
    ) {
      const { signatureInverse } = this.currentArchetype!

      for (let i = 0; i < queryLength; i++) {
        const index = signatureInverse[queryLayout[i]]

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
    setTimeout(this.onDoneBound)
  }

  visitNextEntity() {
    const { currentArchetype, readIndices, componentFilterPredicates } = this
    const { table, entities } = currentArchetype!
    const length = entities.length

    outer: while (++this.entityIndex < length) {
      this.queryResult[0] = entities[this.entityIndex]

      for (let i = 0; i < this.queryLength; i++) {
        const component = table[readIndices[i]][this.entityIndex]!

        if (
          componentFilterPredicates[i]?.(
            component,
            globals.__WORLDS__[globals.__CURRENT_WORLD__]!,
          ) ??
          component._cst === 2
        ) {
          ;(this.queryResult as SelectorResult<S>)[i + 1] = component
        } else {
          continue outer
        }
      }

      return
    }

    this.visitNextArchetype()
  }
}

/**
 * Create a Query with a given set of component types.
 *
 * @param selector Component makeup of entities
 */
export function query<S extends Selector>(...selector: S): Query<S> {
  const pool = createStackPool<QueryIterable<S>>(
    pool => new QueryIterable(selector, pool.release),
    q => {
      q.reset()
      return q
    },
    100,
  )

  return {
    [Symbol.iterator]() {
      return pool.retain().iterable
    },
  }
}
