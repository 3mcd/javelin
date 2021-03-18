import { Archetype, ArchetypeTableColumn } from "./archetype"
import { Component, ComponentOf, ComponentType } from "./component"
import { ComponentFilter, ComponentFilterPredicate } from "./filter"
import { globals } from "./internal/globals"
import { createStackPool } from "./pool"
import { typeIsSuperset } from "./type"
import { World } from "./world"

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

  world: World | null = null

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

    outer: while (this.world!.storage.archetypes[++this.archetypeIndex]) {
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
          componentFilterPredicates[i]?.(component, this.world!) ??
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
      const iterable = pool.retain()
      iterable.world = globals.__WORLDS__[globals.__CURRENT_WORLD__]
      return iterable.iterable
    },
  }
}

export type QueryCachedCallback<S extends Selector> = (
  entity: number,
  selectorResult: SelectorResult<S>,
) => void
export type QueryCached<S extends Selector> = {
  forEach(callback: QueryCachedCallback<S>): void
}
type QueryCachedArchetypeRecord = {
  archetype: Archetype
  columns: ArchetypeTableColumn[]
}

export function queryCached<S extends Selector>(
  world: World,
  ...selector: S
): QueryCached<S> {
  const queryLength = selector.length
  const queryLayout = selector.map(s =>
    "componentType" in s ? s.componentType.type : s.type,
  )
  const querySignature = queryLayout.sort()
  const records: QueryCachedArchetypeRecord[] = []
  const maybeAddArchetypeRecord = (archetype: Archetype) => {
    if (typeIsSuperset(archetype.signature, querySignature)) {
      const columns = queryLayout.map(
        componentTypeId =>
          archetype.table[archetype.signature.indexOf(componentTypeId)],
      )
      records.push({ archetype, columns })
    }
  }
  const componentFilterPredicates = selector.map(s =>
    "componentPredicate" in s ? s.componentPredicate : null,
  )

  world.storage.archetypes.forEach(maybeAddArchetypeRecord)
  world.storage.archetypeCreated.subscribe(maybeAddArchetypeRecord)

  return {
    forEach(callback: QueryCachedCallback<S>) {
      const components = ([] as unknown) as SelectorResult<S>
      for (let i = 0; i < records.length; i++) {
        const { archetype, columns } = records[i]
        const { entities } = archetype
        outer: for (let j = 0; j < entities.length; j++) {
          for (let k = 0; k < queryLength; k++) {
            const component = columns[k][j]
            // components[k] = columns[k][j]
            if (
              componentFilterPredicates[k]?.(component, world) ??
              component._cst === 2
            ) {
              components[k] = component
            } else {
              continue outer
            }
          }
          callback(entities[j], components)
        }
      }
    },
  }
}
